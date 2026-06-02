#!/bin/bash
# Creates test users in quiz-realm (idempotent). Requires quiz-keycloak container running.
set -e

REALM="${KEYCLOAK_REALM:-quiz-realm}"
CONTAINER="${KEYCLOAK_CONTAINER:-quiz-keycloak}"

kcadm() {
  docker exec "$CONTAINER" /opt/keycloak/bin/kcadm.sh "$@"
}

ensure_user() {
  local username="$1"
  local password="$2"
  local role="$3"
  local email="$4"
  local first="$5"
  local last="$6"

  local user_id
  user_id=$(kcadm get users -r "$REALM" -q "username=$username" --fields id --format csv --noquotes 2>/dev/null | tail -n1 || true)

  if [ -z "$user_id" ] || [ "$user_id" = "id" ]; then
    user_id=$(kcadm create users -r "$REALM" \
      -s "username=$username" \
      -s "email=$email" \
      -s "firstName=$first" \
      -s "lastName=$last" \
      -s enabled=true \
      -s emailVerified=true \
      2>&1 | sed -n "s/.*'\([^']*\)'.*/\1/p")
    echo "Created user: $username"
  else
    echo "User exists: $username"
  fi

  kcadm set-password -r "$REALM" --userid "$user_id" --new-password "$password" >/dev/null
  kcadm add-roles -r "$REALM" --uid "$user_id" --rolename "$role" 2>/dev/null || true
}

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "Container '$CONTAINER' is not running. Start with: cd backend && docker compose up -d"
  exit 1
fi

kcadm config credentials --server http://localhost:8080 --realm master --user admin --password admin >/dev/null

ensure_user admin admin123 ADMIN admin@test.com System Admin
ensure_user student student123 STUDENT student@test.com Test Student
ensure_user instructor instructor123 INSTRUCTOR instructor@test.com Test Instructor

echo "Done. Test users ready in realm '$REALM'."

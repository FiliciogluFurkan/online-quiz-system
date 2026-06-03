#!/usr/bin/env bash
# QuizLab — hazır test verisi (kategoriler + sorular).
# Instructor olarak Keycloak'tan token alır, REST API ile oluşturur.
# Çalıştır: bash backend/scripts/seed-test-data.sh
# Not: Tekrar çalıştırılırsa kopya oluşturur.
set -u

KC="${KC_URL:-http://localhost:8180}"
REALM="${KEYCLOAK_REALM:-quiz-realm}"
CLIENT="${KC_CLIENT:-quiz-frontend}"
API="${API_URL:-http://localhost:8080/api}"
U="${SEED_USER:-instructor}"
P="${SEED_PASS:-instructor123}"

echo "Token alınıyor ($U)..."
TOKEN=$(curl -s -X POST "$KC/realms/$REALM/protocol/openid-connect/token" \
  --data-urlencode "grant_type=password" \
  --data-urlencode "client_id=$CLIENT" \
  --data-urlencode "username=$U" \
  --data-urlencode "password=$P" \
  | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//;s/"$//')

if [ -z "${TOKEN:-}" ]; then
  echo "HATA: Token alınamadı."
  echo "  Muhtemel sebep: '$CLIENT' client'ında 'Direct access grants' kapalı."
  echo "  Keycloak admin → quiz-realm → Clients → quiz-frontend → 'Direct access grants enabled' = ON yapıp tekrar dene."
  exit 1
fi
echo "Token OK (${#TOKEN} karakter)."

ensure_cat(){
  local name="$1" desc="$2" id
  id=$(curl -s "$API/categories" -H "Authorization: Bearer $TOKEN" | grep -o "\"id\":[0-9]*,\"name\":\"$name\"" | grep -o '[0-9]*' | head -1)
  if [ -z "$id" ]; then
    id=$(curl -s -X POST "$API/categories" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-raw "{\"name\":\"$name\",\"description\":\"$desc\"}" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
  fi
  echo "$id"
}
add_q(){ printf "  soru: "; curl -s -o /dev/null -w "%{http_code}\n" -X POST "$API/questions" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-raw "$1"; }

echo "Kategoriler (bul-veya-oluştur)..."
C1=$(ensure_cat "Genel Kültür" "Genel kültür soruları")
C2=$(ensure_cat "Bilgisayar Bilimleri" "Algoritma ve veri yapıları")
C3=$(ensure_cat "Matematik" "Temel matematik")
echo "Kategori IDleri: $C1, $C2, $C3"

echo "Sorular oluşturuluyor..."
# Genel Kültür
add_q '{"type":"MULTIPLE_CHOICE","questionText":"Türkiye başkenti neresidir?","options":"A) İstanbul\nB) Ankara\nC) İzmir\nD) Bursa","correctAnswer":"B","points":5,"category":{"id":'"$C1"'}}'
add_q '{"type":"MULTIPLE_CHOICE","questionText":"Bir yılda kaç ay vardır?","options":"A) 10\nB) 11\nC) 12\nD) 13","correctAnswer":"C","points":5,"category":{"id":'"$C1"'}}'
add_q '{"type":"TRUE_FALSE","questionText":"Dünya, Güneş etrafında döner.","options":"","correctAnswer":"true","points":5,"category":{"id":'"$C1"'}}'
add_q '{"type":"SHORT_ANSWER","questionText":"Türkiye nin en kalabalık şehri hangisidir?","options":"","correctAnswer":"İstanbul","points":10,"category":{"id":'"$C1"'}}'
# Bilgisayar Bilimleri
add_q '{"type":"MULTIPLE_CHOICE","questionText":"Stack (yığın) hangi prensiple çalışır?","options":"A) LIFO\nB) FIFO\nC) Rastgele\nD) Sıralı","correctAnswer":"A","points":5,"category":{"id":'"$C2"'}}'
add_q '{"type":"MULTIPLE_CHOICE","questionText":"İkili arama (binary search) ortalama zaman karmaşıklığı nedir?","options":"A) O(n)\nB) O(log n)\nC) O(n^2)\nD) O(1)","correctAnswer":"B","points":10,"category":{"id":'"$C2"'}}'
add_q '{"type":"TRUE_FALSE","questionText":"HTTP, durumsuz (stateless) bir protokoldür.","options":"","correctAnswer":"true","points":5,"category":{"id":'"$C2"'}}'
add_q '{"type":"SHORT_ANSWER","questionText":"Polimorfizm kavramını kısaca açıklayınız.","options":"","correctAnswer":"Aynı arayüzün farklı türlerce farklı şekilde uygulanması","points":10,"category":{"id":'"$C2"'}}'
# Matematik
add_q '{"type":"MULTIPLE_CHOICE","questionText":"2 üzeri 5 kaçtır?","options":"A) 16\nB) 25\nC) 32\nD) 64","correctAnswer":"C","points":5,"category":{"id":'"$C3"'}}'
add_q '{"type":"MULTIPLE_CHOICE","questionText":"Bir üçgenin iç açıları toplamı kaç derecedir?","options":"A) 90\nB) 180\nC) 270\nD) 360","correctAnswer":"B","points":5,"category":{"id":'"$C3"'}}'
add_q '{"type":"TRUE_FALSE","questionText":"En küçük asal sayı 2 dir.","options":"","correctAnswer":"true","points":5,"category":{"id":'"$C3"'}}'
add_q '{"type":"SHORT_ANSWER","questionText":"Türev kavramını bir cümleyle tanımlayınız.","options":"","correctAnswer":"Bir fonksiyonun anlık değişim oranı","points":10,"category":{"id":'"$C3"'}}'

echo "Bitti. 3 kategori + 12 soru eklendi."

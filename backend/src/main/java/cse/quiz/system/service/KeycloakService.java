package cse.quiz.system.service;

import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KeycloakService {
    private final Keycloak keycloak;

    @Value("${keycloak.realm:quiz-realm}")
    private String realm;

    /**
     * STUDENT rolüne sahip tüm kullanıcıların Keycloak ID'lerini getirir
     */
    public List<String> getAllStudentIds() {
        try {
            // Realm'deki tüm kullanıcıları al
            List<UserRepresentation> users = keycloak.realm(realm)
                    .users()
                    .list();

            // STUDENT rolüne sahip olanları filtrele
            return users.stream()
                    .filter(user -> hasRole(user, "STUDENT"))
                    .map(UserRepresentation::getId)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching students from Keycloak: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Kullanıcının belirli bir role sahip olup olmadığını kontrol eder
     */
    private boolean hasRole(UserRepresentation user, String roleName) {
        try {
            return keycloak.realm(realm)
                    .users()
                    .get(user.getId())
                    .roles()
                    .realmLevel()
                    .listEffective()
                    .stream()
                    .anyMatch(role -> role.getName().equals(roleName));
        } catch (Exception e) {
            return false;
        }
    }
}

package cse.quiz.system.service;

import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
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
            return keycloak.realm(realm)
                    .roles()
                    .get("STUDENT")
                    .getUserMembers()
                    .stream()
                    .map(user -> user.getId())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching students from Keycloak: " + e.getMessage());
            return List.of();
        }
    }
}

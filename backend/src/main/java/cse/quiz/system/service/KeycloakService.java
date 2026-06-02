package cse.quiz.system.service;

import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
            List<String> ids = new ArrayList<>();
            int pageSize = 100;
            int page = 0;
            List<UserRepresentation> batch;
            do {
                batch = keycloak.realm(realm)
                        .roles()
                        .get("STUDENT")
                        .getUserMembers(page * pageSize, pageSize);
                batch.stream().map(UserRepresentation::getId).forEach(ids::add);
                page++;
            } while (batch.size() == pageSize);
            return ids;
        } catch (Exception e) {
            System.err.println("Error fetching students from Keycloak: " + e.getMessage());
            return List.of();
        }
    }
}

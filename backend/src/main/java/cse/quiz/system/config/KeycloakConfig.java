package cse.quiz.system.config;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfig {

    @Value("${keycloak.server-url:http://localhost:8080}")
    private String serverUrl;

    @Value("${keycloak.realm:quiz-realm}")
    private String realm;

    @Value("${keycloak.admin-username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin-password:admin}")
    private String adminPassword;

    @Bean
    public Keycloak keycloak() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master") // Admin client master realm'e bağlanır
                .username(adminUsername)
                .password(adminPassword)
                .clientId("admin-cli")
                .build();
    }
}

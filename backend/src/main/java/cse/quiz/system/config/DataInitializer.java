package cse.quiz.system.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Override
    public void run(String... args) {
        // Identity is managed by Keycloak; no local seed data needed.
    }
}

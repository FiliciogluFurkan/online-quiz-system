package cse.quiz.system.service;

import cse.quiz.system.entity.User;
import cse.quiz.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSyncService {

    private final UserRepository userRepository;

    @Transactional
    public User syncFromJwt(Jwt jwt) {
        String keycloakUserId = jwt.getClaimAsString("sub");
        if (keycloakUserId == null) {
            log.warn("No 'sub' claim found in JWT");
            return null;
        }

        String email = jwt.getClaimAsString("email");
        String fullName = resolveFullName(jwt);
        User.UserRole role = resolveRole(jwt);

        log.info("Syncing user: keycloakUserId={}, email={}, fullName={}, role={}", 
                 keycloakUserId, email, fullName, role);

        Optional<User> existing = userRepository.findByKeycloakUserId(keycloakUserId);
        User user = existing.orElseGet(() -> {
            if (email != null) {
                return userRepository.findByEmail(email).orElse(null);
            }
            return null;
        });

        boolean changed = false;
        if (user == null) {
            user = new User();
            user.setKeycloakUserId(keycloakUserId);
            user.setEmail(email != null ? email : keycloakUserId + "@unknown.local");
            user.setFullName(fullName);
            user.setRole(role);
            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());
            changed = true;
        } else {
            if (user.getKeycloakUserId() == null) {
                user.setKeycloakUserId(keycloakUserId);
                changed = true;
            }
            if (email != null && !email.equals(user.getEmail())) {
                user.setEmail(email);
                changed = true;
            }
            if (fullName != null && !fullName.equals(user.getFullName())) {
                user.setFullName(fullName);
                changed = true;
            }
            if (role != null && role != user.getRole()) {
                user.setRole(role);
                changed = true;
            }
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last = user.getLastLoginAt();
        boolean touchLogin = last == null || last.isBefore(now.minusMinutes(5));
        if (touchLogin) {
            user.setLastLoginAt(now);
        }

        if (changed || touchLogin) {
            user.setUpdatedAt(now);
            user = userRepository.save(user);
            log.info("User saved: id={}, email={}, role={}", user.getId(), user.getEmail(), user.getRole());
        }
        return user;
    }

    private String resolveFullName(Jwt jwt) {
        String name = jwt.getClaimAsString("name");
        if (name != null && !name.isBlank()) return name;
        String given = jwt.getClaimAsString("given_name");
        String family = jwt.getClaimAsString("family_name");
        if (given != null || family != null) {
            return ((given != null ? given : "") + " " + (family != null ? family : "")).trim();
        }
        String preferred = jwt.getClaimAsString("preferred_username");
        return preferred != null ? preferred : "Unknown User";
    }

    @SuppressWarnings("unchecked")
    private User.UserRole resolveRole(Jwt jwt) {
        Object realmAccess = jwt.getClaim("realm_access");
        if (realmAccess instanceof Map<?, ?> realmMap) {
            Object rolesObj = realmMap.get("roles");
            if (rolesObj instanceof List<?> roles) {
                List<String> roleStrings = (List<String>) roles;
                if (roleStrings.contains("ADMIN")) return User.UserRole.ADMIN;
                if (roleStrings.contains("INSTRUCTOR")) return User.UserRole.INSTRUCTOR;
                if (roleStrings.contains("STUDENT")) return User.UserRole.STUDENT;
            }
        }
        return User.UserRole.STUDENT;
    }
}

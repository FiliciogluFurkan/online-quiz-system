package cse.quiz.system.repository;

import cse.quiz.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByKeycloakUserId(String keycloakUserId);

    long countByRole(User.UserRole role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.lastLoginAt >= :since")
    long countActiveSince(@Param("since") LocalDateTime since);
}

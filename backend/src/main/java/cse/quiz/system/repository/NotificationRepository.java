package cse.quiz.system.repository;

import cse.quiz.system.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByKeycloakUserIdOrderByCreatedAtDesc(String keycloakUserId);
    
    Long countByKeycloakUserIdAndIsReadFalse(String keycloakUserId);
    
    List<Notification> findByKeycloakUserIdAndIsReadFalse(String keycloakUserId);
}

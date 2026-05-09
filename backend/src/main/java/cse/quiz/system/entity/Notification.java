package cse.quiz.system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "keycloak_user_id", nullable = false)
    private String keycloakUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String relatedEntityType; // "EXAM", "RESULT", etc.
    private Long relatedEntityId;

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false)
    private Boolean isArchived = false;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime readAt;

    public enum NotificationType {
        NEW_EXAM_PUBLISHED,
        EXAM_STARTING_SOON,
        EXAM_GRADED,
        SYSTEM_ANNOUNCEMENT
    }
}

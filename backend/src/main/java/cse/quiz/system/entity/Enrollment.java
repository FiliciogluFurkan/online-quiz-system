package cse.quiz.system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"classroom_id", "keycloak_user_id"}))
@Data
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = true)
    private User student;

    @Column(name = "keycloak_user_id", nullable = false)
    private String keycloakUserId; // kayıtlı öğrencinin Keycloak ID'si

    private LocalDateTime enrolledAt = LocalDateTime.now();
}

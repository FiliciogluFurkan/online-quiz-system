package cse.quiz.system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "student_exams",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"keycloak_user_id", "exam_id"})
    }
)
@Data
public class StudentExam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = true)
    private User student;

    @Column(name = "keycloak_user_id")
    private String keycloakUserId; // Keycloak'tan gelen user ID

    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;

    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    private ExamStatus status = ExamStatus.NOT_STARTED;

    private Double score;

    // Kalıcı değil: sınavın toplam puanı (soruların puan toplamı). Sonuç yanıtlarında doldurulur.
    @Transient
    private Double maxScore;

    public enum ExamStatus {
        NOT_STARTED, IN_PROGRESS, SUBMITTED, GRADED
    }
}

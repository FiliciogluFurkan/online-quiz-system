package cse.quiz.system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "exams")
@Data
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "instructor_id")
    private User instructor;

    @Column(name = "keycloak_instructor_id")
    private String keycloakInstructorId; // Keycloak'tan gelen instructor ID

    private Integer duration; // in minutes

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Boolean randomizeQuestions = false;
    private Boolean published = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}

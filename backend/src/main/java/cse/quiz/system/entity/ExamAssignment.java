package cse.quiz.system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_assignments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"exam_id", "classroom_id"}))
@Data
public class ExamAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    private LocalDateTime assignedAt = LocalDateTime.now();
}

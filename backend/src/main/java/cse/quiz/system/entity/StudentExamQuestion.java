package cse.quiz.system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_exam_questions")
@Data
public class StudentExamQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_exam_id", nullable = false)
    private StudentExam studentExam;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt = LocalDateTime.now();
}

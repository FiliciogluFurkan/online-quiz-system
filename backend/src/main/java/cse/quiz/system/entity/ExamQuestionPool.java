package cse.quiz.system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_question_pool")
@Data
public class ExamQuestionPool {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

package cse.quiz.system.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "exam_questions")
@Data
public class ExamQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    private Integer orderIndex;
}

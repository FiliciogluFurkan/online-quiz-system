package cse.quiz.system.repository;

import cse.quiz.system.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByStudentExamId(Long studentExamId);
}

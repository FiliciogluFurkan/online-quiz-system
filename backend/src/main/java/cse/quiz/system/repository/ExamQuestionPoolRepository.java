package cse.quiz.system.repository;

import cse.quiz.system.entity.ExamQuestionPool;
import cse.quiz.system.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamQuestionPoolRepository extends JpaRepository<ExamQuestionPool, Long> {
    List<ExamQuestionPool> findByExamIdOrderByDisplayOrder(Long examId);
    
    @Query("SELECT eqp.question FROM ExamQuestionPool eqp WHERE eqp.exam.id = :examId ORDER BY eqp.displayOrder")
    List<Question> findQuestionsByExamId(Long examId);
    
    void deleteByExamId(Long examId);
}

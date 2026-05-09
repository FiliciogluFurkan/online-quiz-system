package cse.quiz.system.repository;

import cse.quiz.system.entity.Question;
import cse.quiz.system.entity.StudentExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentExamQuestionRepository extends JpaRepository<StudentExamQuestion, Long> {
    List<StudentExamQuestion> findByStudentExamIdOrderByDisplayOrder(Long studentExamId);
    
    @Query("SELECT seq.question FROM StudentExamQuestion seq WHERE seq.studentExam.id = :studentExamId ORDER BY seq.displayOrder")
    List<Question> findQuestionsByStudentExamId(Long studentExamId);
    
    boolean existsByStudentExamId(Long studentExamId);
}

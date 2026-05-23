package cse.quiz.system.repository;

import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.entity.StudentExam.ExamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StudentExamRepository extends JpaRepository<StudentExam, Long> {
    List<StudentExam> findByStudentId(Long studentId);
    Optional<StudentExam> findByStudentIdAndExamId(Long studentId, Long examId);
    List<StudentExam> findByExamId(Long examId);
    List<StudentExam> findByKeycloakUserIdAndExamId(String keycloakUserId, Long examId);
    List<StudentExam> findByKeycloakUserId(String keycloakUserId);

    @Query("SELECT COUNT(se) FROM StudentExam se WHERE se.status IN :statuses")
    long countByStatusIn(@Param("statuses") java.util.List<ExamStatus> statuses);
}

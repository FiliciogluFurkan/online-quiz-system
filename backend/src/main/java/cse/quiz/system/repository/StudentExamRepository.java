package cse.quiz.system.repository;

import cse.quiz.system.entity.StudentExam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentExamRepository extends JpaRepository<StudentExam, Long> {
    List<StudentExam> findByStudentId(Long studentId);
    Optional<StudentExam> findByStudentIdAndExamId(Long studentId, Long examId);
    List<StudentExam> findByExamId(Long examId);
List<StudentExam> findByKeycloakUserIdAndExamId(String keycloakUserId, Long examId);
    List<StudentExam> findByKeycloakUserId(String keycloakUserId);
}

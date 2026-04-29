package cse.quiz.system.repository;

import cse.quiz.system.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByInstructorId(Long instructorId);
    List<Exam> findByPublishedTrue();
    List<Exam> findByKeycloakInstructorId(String keycloakInstructorId);
}

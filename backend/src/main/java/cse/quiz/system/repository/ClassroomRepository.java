package cse.quiz.system.repository;

import cse.quiz.system.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findByKeycloakInstructorIdOrderByCreatedAtDesc(String keycloakInstructorId);
    Optional<Classroom> findByJoinCode(String joinCode);
    boolean existsByJoinCode(String joinCode);
}

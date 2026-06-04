package cse.quiz.system.repository;

import cse.quiz.system.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByClassroomId(Long classroomId);
    List<Enrollment> findByKeycloakUserId(String keycloakUserId);
    boolean existsByClassroomIdAndKeycloakUserId(Long classroomId, String keycloakUserId);
    Optional<Enrollment> findByClassroomIdAndKeycloakUserId(Long classroomId, String keycloakUserId);
    boolean existsByClassroomIdInAndKeycloakUserId(Collection<Long> classroomIds, String keycloakUserId);
    long countByClassroomId(Long classroomId);
}

package cse.quiz.system.repository;

import cse.quiz.system.entity.ExamAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ExamAssignmentRepository extends JpaRepository<ExamAssignment, Long> {
    List<ExamAssignment> findByExamId(Long examId);
    List<ExamAssignment> findByClassroomId(Long classroomId);
    List<ExamAssignment> findByClassroomIdIn(Collection<Long> classroomIds);
}

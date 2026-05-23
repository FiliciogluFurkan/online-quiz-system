package cse.quiz.system.controller;

import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.exception.UnauthorizedException;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.service.ExamSubmissionService;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/student-exams")
@RequiredArgsConstructor
public class StudentExamController {
    private final StudentExamRepository studentExamRepository;
    private final ExamSubmissionService examSubmissionService;

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public List<StudentExam> getStudentExams(@PathVariable Long studentId) {
        return studentExamRepository.findByStudentId(studentId);
    }

   @GetMapping("/check/{examId}")
public StudentExam checkExamStatus(@PathVariable Long examId) {
    String currentUserId = SecurityUtils.getCurrentUserId();
    
    if (currentUserId != null) {
        List<StudentExam> results = studentExamRepository
            .findByKeycloakUserIdAndExamId(currentUserId, examId);
        
        // SUBMITTED veya GRADED olanı öncelikle döndür
        return results.stream()
            .filter(se -> se.getStatus() == StudentExam.ExamStatus.SUBMITTED || 
                         se.getStatus() == StudentExam.ExamStatus.GRADED)
            .findFirst()
            .orElse(results.stream().findFirst().orElse(null));
    }
    
    return null;
}

    @PostMapping
public StudentExam startExam(@RequestBody StudentExam studentExam) {
    String currentUserId = SecurityUtils.getCurrentUserId();
    
    if (currentUserId != null) {
        List<StudentExam> existing = studentExamRepository
            .findByKeycloakUserIdAndExamId(currentUserId, studentExam.getExam().getId());
        
        // SUBMITTED/GRADED varsa engelle
        boolean alreadyDone = existing.stream()
            .anyMatch(se -> se.getStatus() == StudentExam.ExamStatus.SUBMITTED || 
                           se.getStatus() == StudentExam.ExamStatus.GRADED);
        if (alreadyDone) throw new UnauthorizedException("Bu sınavı zaten tamamladınız!");
        
        // IN_PROGRESS varsa onu döndür
        Optional<StudentExam> inProgress = existing.stream()
            .filter(se -> se.getStatus() == StudentExam.ExamStatus.IN_PROGRESS)
            .findFirst();
        if (inProgress.isPresent()) return inProgress.get();
        
        studentExam.setKeycloakUserId(currentUserId);
    }
    
    studentExam.setStartedAt(LocalDateTime.now());
    studentExam.setStatus(StudentExam.ExamStatus.IN_PROGRESS);
    return studentExamRepository.save(studentExam);
}

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public Map<String, Object> submitExam(
            @PathVariable Long id,
            @RequestBody Map<String, String> answers
    ) {
        StudentExam graded = examSubmissionService.submit(id, answers);
        return Map.of(
                "studentExamId", graded.getId(),
                "status", graded.getStatus(),
                "score", graded.getScore() != null ? graded.getScore() : 0.0
        );
    }

 @PutMapping("/{id}")
public StudentExam updateStudentExam(@PathVariable Long id, @RequestBody StudentExam studentExam) {
    StudentExam existing = studentExamRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("StudentExam not found"));

    String currentUserId = SecurityUtils.getCurrentUserId();
    if (!SecurityUtils.hasAnyRole("INSTRUCTOR", "ADMIN")
            && (currentUserId == null || !currentUserId.equals(existing.getKeycloakUserId()))) {
        throw new UnauthorizedException("Unauthorized");
    }

    existing.setStatus(studentExam.getStatus());
    // score is managed exclusively by GradingService, not settable via this endpoint

    if (studentExam.getStatus() == StudentExam.ExamStatus.SUBMITTED) {
        existing.setSubmittedAt(LocalDateTime.now());
    }

    return studentExamRepository.save(existing);
}
}

package cse.quiz.system.controller;

import cse.quiz.system.entity.Answer;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.repository.AnswerRepository;
import cse.quiz.system.repository.QuestionRepository;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.service.GradingService;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
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
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final GradingService gradingService;

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
        if (alreadyDone) throw new RuntimeException("Bu sınavı zaten tamamladınız!");
        
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
@Transactional
public Map<String, Object> submitExam(
        @PathVariable Long id,
        @RequestBody Map<String, String> answers // questionId (String) -> answerText
) {
    StudentExam existing = studentExamRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("StudentExam not found"));

    String currentUserId = SecurityUtils.getCurrentUserId();
    if (currentUserId == null || !currentUserId.equals(existing.getKeycloakUserId())) {
        throw new RuntimeException("Unauthorized");
    }

    if (existing.getStatus() != StudentExam.ExamStatus.IN_PROGRESS) {
        throw new RuntimeException("Exam is not in progress");
    }

    // Save all answers
    answers.forEach((questionIdStr, answerText) -> {
        if (answerText != null && !answerText.isBlank()) {
            Long questionId = Long.parseLong(questionIdStr);
            Answer answer = new Answer();
            answer.setStudentExam(existing);
            answer.setQuestion(questionRepository.getReferenceById(questionId));
            answer.setAnswerText(answerText);
            answerRepository.save(answer);
        }
    });

    // Mark submitted
    existing.setStatus(StudentExam.ExamStatus.SUBMITTED);
    existing.setSubmittedAt(LocalDateTime.now());
    studentExamRepository.save(existing);

    // Auto-grade (sets GRADED status internally)
    gradingService.gradeExam(id);

    StudentExam graded = studentExamRepository.findById(id).orElseThrow();
    return Map.of(
            "studentExamId", graded.getId(),
            "status", graded.getStatus(),
            "score", graded.getScore() != null ? graded.getScore() : 0.0
    );
}

 @PutMapping("/{id}")
public StudentExam updateStudentExam(@PathVariable Long id, @RequestBody StudentExam studentExam) {
    StudentExam existing = studentExamRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("StudentExam not found"));

    String currentUserId = SecurityUtils.getCurrentUserId();
    if (!SecurityUtils.hasAnyRole("INSTRUCTOR", "ADMIN")
            && (currentUserId == null || !currentUserId.equals(existing.getKeycloakUserId()))) {
        throw new RuntimeException("Unauthorized");
    }

    existing.setStatus(studentExam.getStatus());
    // score is managed exclusively by GradingService, not settable via this endpoint

    if (studentExam.getStatus() == StudentExam.ExamStatus.SUBMITTED) {
        existing.setSubmittedAt(LocalDateTime.now());
    }

    return studentExamRepository.save(existing);
}
}

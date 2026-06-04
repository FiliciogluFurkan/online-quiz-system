package cse.quiz.system.controller;

import cse.quiz.system.entity.Exam;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.exception.ConflictException;
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.exception.UnauthorizedException;
import cse.quiz.system.repository.ExamRepository;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.repository.UserRepository;
import cse.quiz.system.service.ClassroomService;
import cse.quiz.system.service.ExamSubmissionService;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final ClassroomService classroomService;

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public List<StudentExam> getStudentExams(@PathVariable Long studentId) {
        return studentExamRepository.findByStudentId(studentId);
    }

   @GetMapping("/check/{examId}")
public ResponseEntity<?> checkExamStatus(@PathVariable Long examId) {
    String currentUserId = SecurityUtils.getCurrentUserId();
    
    System.out.println("🔍 Checking exam status - Exam ID: " + examId + ", User ID: " + currentUserId);
    
    if (currentUserId == null) {
        System.out.println("❌ Current user ID is null");
        return ResponseEntity.ok(java.util.Map.of("status", "NOT_FOUND"));
    }
    
    List<StudentExam> results = studentExamRepository
        .findByKeycloakUserIdAndExamId(currentUserId, examId);
    
    System.out.println("📊 Found " + results.size() + " records");
    results.forEach(se -> System.out.println("   - Status: " + se.getStatus() + ", ID: " + se.getId()));
    
    // SUBMITTED veya GRADED olanı öncelikle döndür
    StudentExam result = results.stream()
        .filter(se -> se.getStatus() == StudentExam.ExamStatus.SUBMITTED || 
                     se.getStatus() == StudentExam.ExamStatus.GRADED)
        .findFirst()
        .orElse(results.stream().findFirst().orElse(null));
    
    if (result != null) {
        System.out.println("✅ Returning: StudentExam ID " + result.getId() + " with status " + result.getStatus());
        return ResponseEntity.ok(result);
    } else {
        System.out.println("⏳ No record found, returning NOT_FOUND");
        return ResponseEntity.ok(java.util.Map.of("status", "NOT_FOUND"));
    }
}

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
public StudentExam startExam(@RequestBody StudentExam studentExam) {
    String currentUserId = SecurityUtils.getCurrentUserId();

    if (studentExam.getExam() == null || studentExam.getExam().getId() == null) {
        throw new NotFoundException("Sınav bilgisi eksik");
    }

    Exam exam = examRepository.findById(studentExam.getExam().getId())
            .orElseThrow(() -> new NotFoundException("Sınav bulunamadı"));

    if (!Boolean.TRUE.equals(exam.getPublished())) {
        throw new ConflictException("Bu sınav henüz yayında değil");
    }

    // Sınıf-bazlı görünürlük guard'ı: CLASSES ise öğrenci atanmış bir sınıfa kayıtlı olmalı
    if (currentUserId != null && !classroomService.canStudentAccess(exam, currentUserId)) {
        throw new ConflictException("Bu sınava erişim yetkiniz yok");
    }

    LocalDateTime now = LocalDateTime.now();
    if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
        throw new ConflictException("Sınav henüz başlamadı");
    }
    if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
        throw new ConflictException("Sınavın süresi doldu");
    }

    if (currentUserId != null) {
        List<StudentExam> existing = studentExamRepository
            .findByKeycloakUserIdAndExamId(currentUserId, studentExam.getExam().getId());

        // SUBMITTED/GRADED varsa engelle
        boolean alreadyDone = existing.stream()
            .anyMatch(se -> se.getStatus() == StudentExam.ExamStatus.SUBMITTED ||
                           se.getStatus() == StudentExam.ExamStatus.GRADED);
        if (alreadyDone) throw new ConflictException("Bu sınavı zaten tamamladınız!");

        // IN_PROGRESS varsa onu döndür
        Optional<StudentExam> inProgress = existing.stream()
            .filter(se -> se.getStatus() == StudentExam.ExamStatus.IN_PROGRESS)
            .findFirst();
        if (inProgress.isPresent()) return inProgress.get();

        studentExam.setKeycloakUserId(currentUserId);
        userRepository.findByKeycloakUserId(currentUserId).ifPresent(studentExam::setStudent);
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

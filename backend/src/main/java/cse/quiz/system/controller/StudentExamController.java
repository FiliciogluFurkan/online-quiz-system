package cse.quiz.system.controller;

import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/student-exams")
@RequiredArgsConstructor
public class StudentExamController {
    private final StudentExamRepository studentExamRepository;

    @GetMapping("/student/{studentId}")
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

 @PutMapping("/{id}")
public StudentExam updateStudentExam(@PathVariable Long id, @RequestBody StudentExam studentExam) {
    // Önce mevcut kaydı DB'den çek
    StudentExam existing = studentExamRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("StudentExam not found"));
    
    existing.setStatus(studentExam.getStatus());
    existing.setScore(studentExam.getScore());
    
    if (studentExam.getStatus() == StudentExam.ExamStatus.SUBMITTED) {
        existing.setSubmittedAt(LocalDateTime.now());
    }
    
    // keycloakUserId, exam, startedAt gibi alanlar DB'deki haliyle korunur
    return studentExamRepository.save(existing);
}
}

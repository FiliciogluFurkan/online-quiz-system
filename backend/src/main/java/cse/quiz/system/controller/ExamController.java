package cse.quiz.system.controller;

import cse.quiz.system.entity.Exam;
import cse.quiz.system.repository.ExamRepository;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {
    private final ExamRepository examRepository;

    @GetMapping
    public List<Exam> getAllExams() {
        String currentUserId = SecurityUtils.getCurrentUserId();
        
        // Eğer INSTRUCTOR ise sadece kendi sınavlarını göster
        if (currentUserId != null) {
            return examRepository.findByKeycloakInstructorId(currentUserId);
        }
        
        // Fallback: Tüm yayınlanmış sınavları göster (öğrenciler için)
        return examRepository.findByPublishedTrue();
    }

    @GetMapping("/published")
    public List<Exam> getPublishedExams() {
        // Öğrenciler için: Sadece yayınlanmış sınavlar
        return examRepository.findByPublishedTrue();
    }

    @GetMapping("/{id}")
    public Exam getExam(@PathVariable Long id) {
        return examRepository.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Exam createExam(@RequestBody Exam exam) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId != null) {
            exam.setKeycloakInstructorId(currentUserId);
        }
        return examRepository.save(exam);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Exam updateExam(@PathVariable Long id, @RequestBody Exam exam) {
        exam.setId(id);
        return examRepository.save(exam);
    }
}

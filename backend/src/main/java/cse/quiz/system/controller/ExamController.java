package cse.quiz.system.controller;

import cse.quiz.system.entity.Exam;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.repository.ExamRepository;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.repository.UserRepository;
import cse.quiz.system.service.AuditLogService;
import cse.quiz.system.service.NotificationService;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {
    private final ExamRepository examRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final StudentExamRepository studentExamRepository;
    private final AuditLogService auditLogService;

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

    @GetMapping("/with-stats")
    public List<Map<String, Object>> getExamsWithStats() {
        String currentUserId = SecurityUtils.getCurrentUserId();
        boolean isStaff = SecurityUtils.hasAnyRole("INSTRUCTOR", "ADMIN");

        List<Exam> exams;
        if (isStaff && currentUserId != null && SecurityUtils.hasAnyRole("INSTRUCTOR")
                && !SecurityUtils.hasAnyRole("ADMIN")) {
            exams = examRepository.findByKeycloakInstructorId(currentUserId);
        } else if (SecurityUtils.hasAnyRole("ADMIN")) {
            exams = examRepository.findAll();
        } else {
            exams = examRepository.findByPublishedTrue();
        }

        List<Map<String, Object>> result = new ArrayList<>(exams.size());
        for (Exam exam : exams) {
            List<StudentExam> participants = studentExamRepository.findByExamId(exam.getId());
            int enrolledCount = participants.size();
            int completedCount = 0;
            double scoreSum = 0;
            int scoreCount = 0;
            for (StudentExam se : participants) {
                if (se.getStatus() == StudentExam.ExamStatus.SUBMITTED
                        || se.getStatus() == StudentExam.ExamStatus.GRADED) {
                    completedCount++;
                }
                if (se.getStatus() == StudentExam.ExamStatus.GRADED && se.getScore() != null) {
                    scoreSum += se.getScore();
                    scoreCount++;
                }
            }

            Map<String, Object> row = new HashMap<>();
            row.put("exam", exam);
            row.put("enrolledCount", enrolledCount);
            row.put("completedCount", completedCount);
            row.put("avgScore", scoreCount > 0 ? Math.round(scoreSum / scoreCount * 100.0) / 100.0 : null);
            result.add(row);
        }
        return result;
    }

    @GetMapping("/{id}")
    public Exam getExam(@PathVariable Long id) {
        return examRepository.findById(id).orElseThrow(() -> new NotFoundException("Exam not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Exam createExam(@RequestBody Exam exam) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId != null) {
            exam.setKeycloakInstructorId(currentUserId);
            userRepository.findByKeycloakUserId(currentUserId).ifPresent(exam::setInstructor);
        }
        Exam saved = examRepository.save(exam);
        auditLogService.record("Exam", saved.getId(), "CREATE",
                "title=" + saved.getTitle() + ", published=" + saved.getPublished());
        return saved;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Exam updateExam(@PathVariable Long id, @RequestBody Exam exam) {
        Exam existingExam = examRepository.findById(id).orElseThrow(() -> new NotFoundException("Exam not found"));
        boolean wasUnpublished = !existingExam.getPublished();

        exam.setId(id);
        Exam savedExam = examRepository.save(exam);

        if (wasUnpublished && savedExam.getPublished()) {
            notificationService.notifyNewExamPublished(savedExam.getId());
            auditLogService.record("Exam", savedExam.getId(), "PUBLISH", "title=" + savedExam.getTitle());
        } else {
            auditLogService.record("Exam", savedExam.getId(), "UPDATE", "title=" + savedExam.getTitle());
        }

        return savedExam;
    }
}

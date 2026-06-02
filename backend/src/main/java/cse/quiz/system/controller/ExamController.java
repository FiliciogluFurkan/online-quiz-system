package cse.quiz.system.controller;

import cse.quiz.system.entity.Exam;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.exception.ConflictException;
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.exception.UnauthorizedException;
import cse.quiz.system.repository.ExamQuestionRepository;
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
    private final ExamQuestionRepository examQuestionRepository;
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
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Exam updateExam(@PathVariable Long id, @RequestBody Exam exam) {
        Exam existingExam = examRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Sınav bulunamadı"));

        String currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.hasAnyRole("ADMIN");
        if (!isAdmin && (currentUserId == null
                || !currentUserId.equals(existingExam.getKeycloakInstructorId()))) {
            throw new UnauthorizedException("Bu sınavı düzenleme yetkiniz yok");
        }

        boolean wasUnpublished = !existingExam.getPublished();
        boolean willPublish = wasUnpublished && Boolean.TRUE.equals(exam.getPublished());

        if (willPublish) {
            long questionCount = examQuestionRepository.findByExamId(id).size();
            if (questionCount == 0) {
                throw new ConflictException("Sorusu olmayan sınav yayınlanamaz");
            }
        }

        boolean hasParticipants = !studentExamRepository.findByExamId(id).isEmpty();
        if (hasParticipants && !wasUnpublished) {
            existingExam.setTitle(exam.getTitle());
            existingExam.setDescription(exam.getDescription());
            existingExam.setPublished(exam.getPublished());
        } else {
            existingExam.setTitle(exam.getTitle());
            existingExam.setDescription(exam.getDescription());
            existingExam.setDuration(exam.getDuration());
            existingExam.setStartTime(exam.getStartTime());
            existingExam.setEndTime(exam.getEndTime());
            existingExam.setRandomizeQuestions(exam.getRandomizeQuestions());
            existingExam.setPublished(exam.getPublished());
            existingExam.setQuestionPoolEnabled(exam.getQuestionPoolEnabled());
            existingExam.setPoolSize(exam.getPoolSize());
            existingExam.setQuestionsPerStudent(exam.getQuestionsPerStudent());
        }

        Exam savedExam = examRepository.save(existingExam);

        if (willPublish) {
            notificationService.notifyNewExamPublished(savedExam.getId());
            auditLogService.record("Exam", savedExam.getId(), "PUBLISH", "title=" + savedExam.getTitle());
        } else {
            auditLogService.record("Exam", savedExam.getId(), "UPDATE", "title=" + savedExam.getTitle());
        }

        return savedExam;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public void deleteExam(@PathVariable Long id) {
        Exam existing = examRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Sınav bulunamadı"));

        String currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.hasAnyRole("ADMIN");
        if (!isAdmin && (currentUserId == null
                || !currentUserId.equals(existing.getKeycloakInstructorId()))) {
            throw new UnauthorizedException("Bu sınavı silme yetkiniz yok");
        }

        if (!studentExamRepository.findByExamId(id).isEmpty()) {
            throw new ConflictException("Öğrencilerin girdiği sınavlar silinemez");
        }

        examRepository.delete(existing);
        auditLogService.record("Exam", id, "DELETE", "title=" + existing.getTitle());
    }
}

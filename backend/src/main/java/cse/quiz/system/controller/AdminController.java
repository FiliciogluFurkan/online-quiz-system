package cse.quiz.system.controller;

import cse.quiz.system.entity.AuditLog;
import cse.quiz.system.entity.Exam;
import cse.quiz.system.entity.Question;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.entity.User;
import cse.quiz.system.repository.AuditLogRepository;
import cse.quiz.system.repository.ClassroomRepository;
import cse.quiz.system.repository.ExamRepository;
import cse.quiz.system.repository.QuestionRepository;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.repository.UserRepository;
import cse.quiz.system.service.AuditLogService;
import cse.quiz.system.service.KeycloakService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final StudentExamRepository studentExamRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;
    private final KeycloakService keycloakService;
    private final ClassroomRepository classroomRepository;

    @GetMapping("/stats")
    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalExams", examRepository.count());
        stats.put("totalQuestions", questionRepository.count());
        stats.put("totalClassrooms", classroomRepository.count());
        stats.put("totalStudentExams", studentExamRepository.count());
        stats.put("completedExams", studentExamRepository.countByStatusIn(
                List.of(StudentExam.ExamStatus.GRADED, StudentExam.ExamStatus.SUBMITTED)));

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countActiveSince(LocalDateTime.now().minusDays(30));
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);

        return stats;
    }

    @GetMapping("/users/role-counts")
    public Map<String, Object> getUserRoleCounts() {
        long students = userRepository.countByRole(User.UserRole.STUDENT);
        long instructors = userRepository.countByRole(User.UserRole.INSTRUCTOR);
        long admins = userRepository.countByRole(User.UserRole.ADMIN);

        Map<String, Object> result = new HashMap<>();
        result.put("STUDENT", students);
        result.put("INSTRUCTOR", instructors);
        result.put("ADMIN", admins);
        result.put("total", students + instructors + admins);
        return result;
    }

    @GetMapping("/exams")
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    @GetMapping("/exams/{id}")
    public Exam getExamById(@PathVariable Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
    }

    @GetMapping("/questions")
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    @GetMapping("/student-exams")
    public List<StudentExam> getAllStudentExams() {
        return studentExamRepository.findAll();
    }

    @DeleteMapping("/exams/{id}")
    public void deleteExam(@PathVariable Long id) {
        examRepository.deleteById(id);
        auditLogService.record("Exam", id, "DELETE", null);
    }

    @DeleteMapping("/questions/{id}")
    public Map<String, Object> deleteQuestion(@PathVariable Long id) {
        try {
            Question question = questionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Question not found"));
            
            questionRepository.deleteById(id);
            auditLogService.record("Question", id, "DELETE", null);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Soru başarıyla silindi");
            return result;
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            error.put("message", "Soru silinemedi. Bu soru bir sınavda kullanılıyor olabilir.");
            return error;
        }
    }
        auditLogService.record("Question", id, "DELETE", null);
    }

    @GetMapping("/exams/{id}/audit-log")
    public List<AuditLog> getExamAuditLog(@PathVariable Long id) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc("Exam", id);
    }

    @GetMapping("/audit-log")
    public Page<AuditLog> getAuditLog(
            @RequestParam(required = false) String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageRequest pageable = PageRequest.of(page, Math.min(size, 200));
        if (entityType != null && !entityType.isBlank()) {
            return auditLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType, pageable);
        }
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @PostMapping("/users/sync-from-keycloak")
    public Map<String, Object> syncUsersFromKeycloak() {
        try {
            List<org.keycloak.representations.idm.UserRepresentation> keycloakUsers = 
                keycloakService.getAllUsers();
            
            int synced = 0;
            int updated = 0;
            int created = 0;

            for (org.keycloak.representations.idm.UserRepresentation kcUser : keycloakUsers) {
                String keycloakUserId = kcUser.getId();
                String email = kcUser.getEmail();
                String fullName = resolveFullName(kcUser);
                User.UserRole role = resolveRoleFromKeycloak(kcUser);

                User user = userRepository.findByKeycloakUserId(keycloakUserId).orElse(null);
                
                if (user == null) {
                    user = new User();
                    user.setKeycloakUserId(keycloakUserId);
                    user.setEmail(email != null ? email : keycloakUserId + "@unknown.local");
                    user.setFullName(fullName);
                    user.setRole(role);
                    user.setActive(true);
                    user.setCreatedAt(LocalDateTime.now());
                    created++;
                } else {
                    user.setEmail(email != null ? email : user.getEmail());
                    user.setFullName(fullName);
                    user.setRole(role);
                    user.setUpdatedAt(LocalDateTime.now());
                    updated++;
                }
                
                userRepository.save(user);
                synced++;
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("totalSynced", synced);
            result.put("created", created);
            result.put("updated", updated);
            result.put("message", synced + " kullanıcı Keycloak'tan senkronize edildi");
            
            return result;
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return error;
        }
    }

    private String resolveFullName(org.keycloak.representations.idm.UserRepresentation kcUser) {
        String firstName = kcUser.getFirstName();
        String lastName = kcUser.getLastName();
        
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (lastName != null) {
            return lastName;
        } else if (kcUser.getUsername() != null) {
            return kcUser.getUsername();
        }
        return "Unknown User";
    }

    private User.UserRole resolveRoleFromKeycloak(org.keycloak.representations.idm.UserRepresentation kcUser) {
        List<String> roles = keycloakService.getUserRoles(kcUser.getId());
        
        if (roles.contains("ADMIN")) return User.UserRole.ADMIN;
        if (roles.contains("INSTRUCTOR")) return User.UserRole.INSTRUCTOR;
        if (roles.contains("STUDENT")) return User.UserRole.STUDENT;
        
        return User.UserRole.STUDENT; // default
    }
}

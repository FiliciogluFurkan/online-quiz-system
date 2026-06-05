package cse.quiz.system.controller;

import cse.quiz.system.dto.ClassroomRequest;
import cse.quiz.system.dto.JoinClassRequest;
import cse.quiz.system.entity.Classroom;
import cse.quiz.system.entity.Enrollment;
import cse.quiz.system.entity.ExamAssignment;
import cse.quiz.system.entity.User;
import cse.quiz.system.exception.ConflictException;
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.exception.UnauthorizedException;
import cse.quiz.system.repository.ClassroomRepository;
import cse.quiz.system.repository.EnrollmentRepository;
import cse.quiz.system.repository.ExamAssignmentRepository;
import cse.quiz.system.repository.UserRepository;
import cse.quiz.system.service.AuditLogService;
import cse.quiz.system.service.ClassroomService;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
public class ClassroomController {
    private final ClassroomRepository classroomRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ExamAssignmentRepository examAssignmentRepository;
    private final UserRepository userRepository;
    private final ClassroomService classroomService;
    private final AuditLogService auditLogService;

    // ───────────────────────── Eğitmen: sınıf yönetimi ─────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Classroom createClassroom(@RequestBody ClassroomRequest req) {
        if (req.name() == null || req.name().isBlank()) {
            throw new ConflictException("Sınıf adı zorunludur");
        }
        Classroom c = new Classroom();
        c.setName(req.name().trim());
        c.setDescription(req.description());
        c.setJoinCode(classroomService.generateUniqueJoinCode());
        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId != null) {
            c.setKeycloakInstructorId(currentUserId);
            userRepository.findByKeycloakUserId(currentUserId).ifPresent(c::setInstructor);
        }
        Classroom saved = classroomRepository.save(c);
        auditLogService.record("Classroom", saved.getId(), "CREATE",
                "name=" + saved.getName() + ", joinCode=" + saved.getJoinCode());
        return saved;
    }

    @GetMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public List<Map<String, Object>> getMyClassrooms() {
        String currentUserId = SecurityUtils.getCurrentUserId();
        List<Classroom> classrooms = currentUserId == null ? List.of()
                : classroomRepository.findByKeycloakInstructorIdOrderByCreatedAtDesc(currentUserId);

        List<Map<String, Object>> result = new ArrayList<>(classrooms.size());
        for (Classroom c : classrooms) {
            Map<String, Object> row = new HashMap<>();
            row.put("classroom", c);
            row.put("enrolledCount", enrollmentRepository.countByClassroomId(c.getId()));
            row.put("examCount", examAssignmentRepository.findByClassroomId(c.getId()).size());
            result.add(row);
        }
        return result;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Map<String, Object> getClassroom(@PathVariable Long id) {
        Classroom c = requireOwnedClassroom(id);

        List<Map<String, Object>> members = new ArrayList<>();
        for (Enrollment e : enrollmentRepository.findByClassroomId(id)) {
            Map<String, Object> m = new HashMap<>();
            m.put("enrollmentId", e.getId());
            m.put("keycloakUserId", e.getKeycloakUserId());
            User student = e.getStudent();
            m.put("fullName", student != null ? student.getFullName() : null);
            m.put("email", student != null ? student.getEmail() : null);
            m.put("enrolledAt", e.getEnrolledAt());
            members.add(m);
        }

        List<Map<String, Object>> exams = new ArrayList<>();
        for (ExamAssignment a : examAssignmentRepository.findByClassroomId(id)) {
            Map<String, Object> ex = new HashMap<>();
            ex.put("examId", a.getExam().getId());
            ex.put("title", a.getExam().getTitle());
            ex.put("published", a.getExam().getPublished());
            ex.put("assignedAt", a.getAssignedAt());
            exams.add(ex);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("classroom", c);
        result.put("members", members);
        result.put("exams", exams);
        return result;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Classroom updateClassroom(@PathVariable Long id, @RequestBody ClassroomRequest req) {
        Classroom c = requireOwnedClassroom(id);
        if (req.name() != null && !req.name().isBlank()) {
            c.setName(req.name().trim());
        }
        c.setDescription(req.description());
        Classroom saved = classroomRepository.save(c);
        auditLogService.record("Classroom", saved.getId(), "UPDATE", "name=" + saved.getName());
        return saved;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public void deleteClassroom(@PathVariable Long id) {
        Classroom c = requireOwnedClassroom(id);
        if (!examAssignmentRepository.findByClassroomId(id).isEmpty()) {
            throw new ConflictException("Sınava atanmış sınıf silinemez. Önce atamaları kaldırın.");
        }
        // kayıtlı öğrenciler de kaldırılır
        enrollmentRepository.findByClassroomId(id).forEach(enrollmentRepository::delete);
        classroomRepository.delete(c);
        auditLogService.record("Classroom", id, "DELETE", "name=" + c.getName());
    }

    @DeleteMapping("/{id}/enrollments/{enrollmentId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public void removeStudent(@PathVariable Long id, @PathVariable Long enrollmentId) {
        requireOwnedClassroom(id);
        Enrollment e = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new NotFoundException("Kayıt bulunamadı"));
        if (!e.getClassroom().getId().equals(id)) {
            throw new ConflictException("Kayıt bu sınıfa ait değil");
        }
        enrollmentRepository.delete(e);
        auditLogService.record("Enrollment", enrollmentId, "DELETE",
                "classroom=" + id + ", student=" + e.getKeycloakUserId());
    }

    // ───────────────────────── Öğrenci: katılım ─────────────────────────

    @PostMapping("/join")
    @PreAuthorize("hasRole('STUDENT')")
    public Map<String, Object> joinClassroom(@RequestBody JoinClassRequest req) {
        if (req.joinCode() == null || req.joinCode().isBlank()) {
            throw new ConflictException("Katılım kodu zorunludur");
        }
        String code = req.joinCode().trim().toUpperCase();
        Classroom c = classroomRepository.findByJoinCode(code)
                .orElseThrow(() -> new NotFoundException("Geçersiz katılım kodu"));

        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new UnauthorizedException("Oturum bulunamadı");
        }
        if (enrollmentRepository.existsByClassroomIdAndKeycloakUserId(c.getId(), currentUserId)) {
            throw new ConflictException("Bu sınıfa zaten kayıtlısınız");
        }

        Enrollment e = new Enrollment();
        e.setClassroom(c);
        e.setKeycloakUserId(currentUserId);
        userRepository.findByKeycloakUserId(currentUserId).ifPresent(e::setStudent);
        enrollmentRepository.save(e);
        auditLogService.record("Enrollment", e.getId(), "CREATE",
                "classroom=" + c.getId() + ", student=" + currentUserId);

        Map<String, Object> result = new HashMap<>();
        result.put("classroomId", c.getId());
        result.put("name", c.getName());
        return result;
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<Map<String, Object>> getMyEnrolledClassrooms() {
        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) return List.of();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Enrollment e : enrollmentRepository.findByKeycloakUserId(currentUserId)) {
            Classroom c = e.getClassroom();
            Map<String, Object> row = new HashMap<>();
            row.put("classroomId", c.getId());
            row.put("name", c.getName());
            row.put("description", c.getDescription());
            row.put("instructorName", c.getInstructor() != null ? c.getInstructor().getFullName() : null);
            row.put("enrolledAt", e.getEnrolledAt());
            result.add(row);
        }
        return result;
    }

    // ───────────────────────── yardımcı ─────────────────────────

    private Classroom requireOwnedClassroom(Long id) {
        Classroom c = classroomRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Sınıf bulunamadı"));
        String currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.hasAnyRole("ADMIN");
        if (!isAdmin && (currentUserId == null
                || !currentUserId.equals(c.getKeycloakInstructorId()))) {
            throw new UnauthorizedException("Bu sınıf üzerinde yetkiniz yok");
        }
        return c;
    }
}

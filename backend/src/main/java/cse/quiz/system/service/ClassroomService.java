package cse.quiz.system.service;

import cse.quiz.system.entity.Classroom;
import cse.quiz.system.entity.Enrollment;
import cse.quiz.system.entity.Exam;
import cse.quiz.system.entity.ExamAssignment;
import cse.quiz.system.repository.ClassroomRepository;
import cse.quiz.system.repository.EnrollmentRepository;
import cse.quiz.system.repository.ExamAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomService {
    // Karışan karakterler (0/O, 1/I, vb.) çıkarıldı
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ClassroomRepository classroomRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ExamAssignmentRepository examAssignmentRepository;

    /** Benzersiz 6 haneli katılım kodu üretir. */
    public String generateUniqueJoinCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
            }
            code = sb.toString();
        } while (classroomRepository.existsByJoinCode(code));
        return code;
    }

    /** Öğrencinin (keycloak id) kayıtlı olduğu sınıf id'leri. */
    public List<Long> enrolledClassroomIds(String keycloakUserId) {
        return enrollmentRepository.findByKeycloakUserId(keycloakUserId).stream()
                .map(e -> e.getClassroom().getId())
                .collect(Collectors.toList());
    }

    /**
     * Yayınlı sınavlardan öğrencinin erişebileceklerini süzer:
     * görünürlük PUBLIC (veya null) ise herkese; CLASSES ise yalnızca
     * öğrencinin kayıtlı olduğu bir sınıfa atanmışsa.
     */
    public List<Exam> filterAccessibleForStudent(List<Exam> publishedExams, String keycloakUserId) {
        List<Long> classIds = enrolledClassroomIds(keycloakUserId);
        Set<Long> assignedExamIds = classIds.isEmpty() ? Set.of()
                : examAssignmentRepository.findByClassroomIdIn(classIds).stream()
                        .map(a -> a.getExam().getId())
                        .collect(Collectors.toSet());

        return publishedExams.stream()
                .filter(e -> e.getVisibility() != Exam.Visibility.CLASSES
                        || assignedExamIds.contains(e.getId()))
                .collect(Collectors.toList());
    }

    /** Öğrencinin verili sınava (atama/görünürlük açısından) erişimi var mı? */
    public boolean canStudentAccess(Exam exam, String keycloakUserId) {
        if (exam.getVisibility() != Exam.Visibility.CLASSES) {
            return true; // PUBLIC veya null → herkese açık
        }
        List<Long> assignedClassIds = examAssignmentRepository.findByExamId(exam.getId()).stream()
                .map(a -> a.getClassroom().getId())
                .collect(Collectors.toList());
        if (assignedClassIds.isEmpty()) {
            return false;
        }
        return enrollmentRepository.existsByClassroomIdInAndKeycloakUserId(assignedClassIds, keycloakUserId);
    }

    /** Bir sınava atanmış sınıfların öğrenci keycloak id'leri (bildirim hedefleme için). */
    public List<String> studentIdsForExamClasses(Long examId) {
        List<Long> classIds = examAssignmentRepository.findByExamId(examId).stream()
                .map(a -> a.getClassroom().getId())
                .collect(Collectors.toList());
        if (classIds.isEmpty()) return List.of();
        return classIds.stream()
                .flatMap(cid -> enrollmentRepository.findByClassroomId(cid).stream())
                .map(Enrollment::getKeycloakUserId)
                .distinct()
                .collect(Collectors.toList());
    }
}

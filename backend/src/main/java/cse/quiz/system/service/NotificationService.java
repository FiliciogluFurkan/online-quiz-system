package cse.quiz.system.service;

import cse.quiz.system.entity.Exam;
import cse.quiz.system.entity.Notification;
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.repository.ExamRepository;
import cse.quiz.system.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final ExamRepository examRepository;
    private final KeycloakService keycloakService;
    private final ClassroomService classroomService;

    @Async
    @Transactional
    public void notifyNewExamPublished(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new NotFoundException("Exam not found: " + examId));

        // CLASSES görünürlüğünde yalnızca atanmış sınıfların öğrencilerine, aksi halde herkese
        List<String> studentIds = exam.getVisibility() == Exam.Visibility.CLASSES
                ? classroomService.studentIdsForExamClasses(examId)
                : keycloakService.getAllStudentIds();

        List<Notification> notifications = new ArrayList<>();
        for (String studentId : studentIds) {
            Notification notification = new Notification();
            notification.setKeycloakUserId(studentId);
            notification.setType(Notification.NotificationType.NEW_EXAM_PUBLISHED);
            notification.setTitle("Yeni Sınav Yayınlandı");
            notification.setMessage(exam.getTitle() + " sınavı yayınlandı!");
            notification.setRelatedEntityType("EXAM");
            notification.setRelatedEntityId(examId);
            notifications.add(notification);
        }
        notificationRepository.saveAll(notifications);
    }

    public List<Notification> getUserNotifications(String keycloakUserId) {
        return notificationRepository.findByKeycloakUserIdOrderByCreatedAtDesc(keycloakUserId);
    }

    public Long getUnreadCount(String keycloakUserId) {
        return notificationRepository.countByKeycloakUserIdAndIsReadFalse(keycloakUserId);
    }

    public void markAsRead(Long notificationId, String keycloakUserId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getKeycloakUserId().equals(keycloakUserId)) {
            throw new RuntimeException("Unauthorized access to notification");
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    public void markAllAsRead(String keycloakUserId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByKeycloakUserIdAndIsReadFalse(keycloakUserId);

        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        }

        notificationRepository.saveAll(unreadNotifications);
    }
}

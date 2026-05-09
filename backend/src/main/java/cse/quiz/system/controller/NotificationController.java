package cse.quiz.system.controller;

import cse.quiz.system.entity.Notification;
import cse.quiz.system.service.NotificationService;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public List<Notification> getMyNotifications() {
        String userId = SecurityUtils.getCurrentUserId();
        return notificationService.getUserNotifications(userId);
    }

    @GetMapping("/unread-count")
    public Long getUnreadCount() {
        String userId = SecurityUtils.getCurrentUserId();
        return notificationService.getUnreadCount(userId);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        String userId = SecurityUtils.getCurrentUserId();
        notificationService.markAsRead(id, userId);
    }

    @PutMapping("/mark-all-read")
    public void markAllAsRead() {
        String userId = SecurityUtils.getCurrentUserId();
        notificationService.markAllAsRead(userId);
    }
}

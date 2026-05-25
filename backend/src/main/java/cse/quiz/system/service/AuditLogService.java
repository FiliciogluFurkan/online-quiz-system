package cse.quiz.system.service;

import cse.quiz.system.entity.AuditLog;
import cse.quiz.system.entity.User;
import cse.quiz.system.repository.AuditLogRepository;
import cse.quiz.system.repository.UserRepository;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void record(String entityType, Long entityId, String action, String payload) {
        try {
            AuditLog entry = new AuditLog();
            entry.setEntityType(entityType);
            entry.setEntityId(entityId);
            entry.setAction(action);
            entry.setPayload(payload);
            String actorId = SecurityUtils.getCurrentUserId();
            if (actorId != null) {
                entry.setActorKeycloakId(actorId);
                userRepository.findByKeycloakUserId(actorId)
                        .map(User::getFullName)
                        .ifPresent(entry::setActorName);
            }
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.error("Failed to record audit log for {}#{} action={}", entityType, entityId, action, e);
        }
    }
}

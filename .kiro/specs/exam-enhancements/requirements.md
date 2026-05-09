# Requirements Document

## Introduction

Bu doküman, Online Quiz ve Sınav Sistemi için 3 yeni özelliğin gereksinimlerini tanımlar:
1. **Soru Havuzu Sistemi**: Sınavlarda rastgele soru seçimi
2. **Bildirim Sistemi**: Yeni sınav yayınlandığında öğrencilere bildirim
3. **Sınav Zamanlayıcı Uyarıları**: Süre azaldıkça öğrenciye uyarılar

Bu özellikler, sistemin kullanılabilirliğini artıracak ve daha adil sınav ortamı sağlayacaktır.

## Glossary

- **Soru Havuzu (Question Pool)**: Bir sınavda kullanılmak üzere hazırlanan, gerçek sınav soru sayısından fazla soru içeren koleksiyon
- **Rastgele Seçim (Random Selection)**: Her öğrenciye soru havuzundan farklı sorular gösterilmesi
- **Bildirim (Notification)**: Kullanıcıya sistem tarafından gönderilen mesaj
- **Zamanlayıcı Uyarısı (Timer Alert)**: Sınav süresi azaldığında gösterilen uyarı mesajı
- **Instructor**: Sınav oluşturan ve yöneten öğretmen
- **Student**: Sınav çözen öğrenci
- **Exam**: Sınav entity'si
- **Question**: Soru entity'si
- **StudentExam**: Öğrencinin sınav kaydı

## Requirements

### Requirement 1: Soru Havuzu Sistemi

**User Story:** As an instructor, I want to create a question pool for exams, so that each student receives a different random subset of questions to prevent cheating.

#### Acceptance Criteria

1. WHEN an instructor creates an exam, THE System SHALL provide an option to enable "Question Pool Mode"
2. WHEN Question Pool Mode is enabled, THE System SHALL allow the instructor to specify the pool size (total questions) and exam size (questions per student)
3. WHEN an instructor adds questions to a pool-enabled exam, THE System SHALL validate that pool size is greater than or equal to exam size
4. WHEN a student starts a pool-enabled exam, THE System SHALL randomly select the specified number of questions from the pool
5. WHEN a student starts a pool-enabled exam, THE System SHALL ensure the same student receives the same questions if they refresh or return to the exam
6. WHEN calculating exam statistics for pool-enabled exams, THE System SHALL show statistics for all questions in the pool
7. WHEN displaying results for pool-enabled exams, THE System SHALL show only the questions that were assigned to that specific student

### Requirement 2: Bildirim Sistemi

**User Story:** As a student, I want to receive notifications when new exams are published, so that I don't miss any exams.

#### Acceptance Criteria

1. WHEN an instructor publishes a new exam (sets startTime to current or future), THE System SHALL create notifications for all students
2. WHEN a student logs in, THE System SHALL display unread notification count in the navbar
3. WHEN a student clicks on the notification icon, THE System SHALL display a list of all notifications with read/unread status
4. WHEN a student clicks on a notification, THE System SHALL mark it as read and navigate to the relevant exam
5. WHEN a student views the notification list, THE System SHALL show notification type, message, timestamp, and read status
6. WHEN a notification is older than 30 days, THE System SHALL automatically mark it as archived (but still visible)

### Requirement 3: Sınav Zamanlayıcı Uyarıları

**User Story:** As a student, I want to receive alerts when exam time is running low, so that I can manage my time effectively.

#### Acceptance Criteria

1. WHEN a student is taking an exam and 5 minutes remain, THE System SHALL display a warning notification
2. WHEN a student is taking an exam and 1 minute remains, THE System SHALL display a critical warning notification
3. WHEN the timer shows less than 5 minutes, THE System SHALL change the timer color to orange
4. WHEN the timer shows less than 1 minute, THE System SHALL change the timer color to red
5. WHEN a warning is displayed, THE System SHALL show it as a non-blocking toast notification that auto-dismisses after 5 seconds
6. WHEN multiple warnings occur, THE System SHALL ensure each warning is shown only once per exam session
7. WHEN exam time expires, THE System SHALL automatically submit the exam and show a timeout message

## Additional Notes

### Technical Considerations

- Soru havuzu için rastgele seçim algoritması seed-based olmalı (aynı öğrenci her zaman aynı soruları görmeli)
- Bildirimler için yeni bir Notification entity oluşturulmalı
- Zamanlayıcı uyarıları client-side olarak çalışmalı (backend'e sürekli istek atmadan)
- Bildirim sistemi gerçek zamanlı değil, sayfa yenilendiğinde güncellenecek (WebSocket opsiyonel gelecek özellik)

### Future Enhancements

- WebSocket ile gerçek zamanlı bildirimler
- Email bildirimleri
- Ses uyarıları (zamanlayıcı için)
- Bildirim tercihleri (öğrenci hangi bildirimleri almak istiyor)
- Soru havuzunda kategori bazlı rastgele seçim (her kategoriden X soru)

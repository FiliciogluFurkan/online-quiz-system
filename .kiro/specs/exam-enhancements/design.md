# Design Document - Exam Enhancements

## Overview

Bu doküman, Online Quiz ve Sınav Sistemi için 3 yeni özelliğin teknik tasarımını içerir:

1. **Soru Havuzu Sistemi**: Sınavlarda her öğrenciye farklı rastgele sorular gösterme
2. **Bildirim Sistemi**: Yeni sınav yayınlandığında öğrencilere bildirim gönderme
3. **Sınav Zamanlayıcı Uyarıları**: Süre azaldıkça öğrenciye uyarılar gösterme

Bu özellikler mevcut sisteme entegre edilecek ve geriye dönük uyumlu olacaktır.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Question Pool│  │ Notification │  │ Timer Alerts │      │
│  │   Component  │  │   Component  │  │   Component  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    REST API (Spring Boot)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Question Pool│  │ Notification │  │    Exam      │      │
│  │  Controller  │  │  Controller  │  │  Controller  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Question Pool│  │ Notification │                        │
│  │   Service    │  │   Service    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ exam_question│  │ notifications│  │student_exam_ │      │
│  │    _pool     │  │              │  │  questions   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Soru Havuzu Sistemi

#### Backend Components

**New Entity: ExamQuestionPool**
```java
@Entity
@Table(name = "exam_question_pool")
public class ExamQuestionPool {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;
    
    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;
    
    private Integer displayOrder; // Havuzdaki sıra
    
    private LocalDateTime createdAt;
}
```

**New Entity: StudentExamQuestion**
```java
@Entity
@Table(name = "student_exam_questions")
public class StudentExamQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "student_exam_id")
    private StudentExam studentExam;
    
    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;
    
    private Integer displayOrder; // Öğrenciye gösterilen sıra
    
    private LocalDateTime assignedAt;
}
```

**Updated Entity: Exam**
```java
// Yeni alanlar eklenecek
private Boolean questionPoolEnabled = false;
private Integer poolSize; // Havuzdaki toplam soru sayısı
private Integer questionsPerStudent; // Her öğrenciye gösterilecek soru sayısı
```

**New Service: QuestionPoolService**
```java
public interface QuestionPoolService {
    // Sınava soru havuzu ekle
    void addQuestionsToPool(Long examId, List<Long> questionIds);
    
    // Öğrenci için rastgele sorular seç
    List<Question> assignRandomQuestions(Long studentExamId);
    
    // Öğrencinin atanmış sorularını getir
    List<Question> getAssignedQuestions(Long studentExamId);
    
    // Havuzdaki tüm soruları getir (istatistikler için)
    List<Question> getPoolQuestions(Long examId);
}
```

#### Frontend Components

**CreateExam Component Updates**
- Question Pool Mode checkbox
- Pool size ve questions per student input alanları
- Validation: poolSize >= questionsPerStudent

**TakeExam Component Updates**
- Soru havuzundan atanmış soruları göster
- İlk girişte rastgele seçim yap (eğer daha önce atanmamışsa)

### 2. Bildirim Sistemi

#### Backend Components

**New Entity: Notification**
```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "keycloak_user_id")
    private String keycloakUserId; // Bildirimi alacak kullanıcı
    
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private String relatedEntityType; // "EXAM", "RESULT", etc.
    private Long relatedEntityId;
    
    private Boolean isRead = false;
    private Boolean isArchived = false;
    
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    
    public enum NotificationType {
        NEW_EXAM_PUBLISHED,
        EXAM_STARTING_SOON,
        EXAM_GRADED,
        SYSTEM_ANNOUNCEMENT
    }
}
```

**New Service: NotificationService**
```java
public interface NotificationService {
    // Yeni sınav yayınlandığında tüm öğrencilere bildirim
    void notifyNewExamPublished(Long examId);
    
    // Kullanıcının bildirimlerini getir
    List<Notification> getUserNotifications(String keycloakUserId);
    
    // Okunmamış bildirim sayısı
    Long getUnreadCount(String keycloakUserId);
    
    // Bildirimi okundu olarak işaretle
    void markAsRead(Long notificationId);
    
    // Tüm bildirimleri okundu olarak işaretle
    void markAllAsRead(String keycloakUserId);
    
    // 30 günden eski bildirimleri arşivle
    void archiveOldNotifications();
}
```

**New Controller: NotificationController**
```java
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @GetMapping
    public List<Notification> getMyNotifications();
    
    @GetMapping("/unread-count")
    public Long getUnreadCount();
    
    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id);
    
    @PutMapping("/mark-all-read")
    public void markAllAsRead();
}
```

#### Frontend Components

**New Component: NotificationBell**
```tsx
// Navbar'da gösterilecek
interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}
```

**New Page: NotificationList**
```tsx
// Bildirimleri listeleyen sayfa
interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityType: string;
  relatedEntityId: number;
}
```

### 3. Sınav Zamanlayıcı Uyarıları

#### Frontend Components (Client-Side Only)

**TakeExam Component Updates**
```tsx
// Yeni state'ler
const [showWarning5Min, setShowWarning5Min] = useState(false);
const [showWarning1Min, setShowWarning1Min] = useState(false);
const [timerColor, setTimerColor] = useState('default');

// Timer effect
useEffect(() => {
  const interval = setInterval(() => {
    const remaining = calculateRemainingTime();
    
    // 5 dakika kontrolü
    if (remaining <= 5 * 60 && remaining > 4 * 60 && !showWarning5Min) {
      showToast('⚠️ 5 dakika kaldı!', 'warning');
      setShowWarning5Min(true);
      setTimerColor('orange');
    }
    
    // 1 dakika kontrolü
    if (remaining <= 60 && remaining > 0 && !showWarning1Min) {
      showToast('🚨 1 dakika kaldı!', 'critical');
      setShowWarning1Min(true);
      setTimerColor('red');
    }
    
    // Süre bitti
    if (remaining <= 0) {
      autoSubmitExam();
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

**New Component: Toast**
```tsx
interface ToastProps {
  message: string;
  type: 'info' | 'warning' | 'critical';
  duration?: number; // default 5000ms
  onClose: () => void;
}
```

## Data Models

### Database Schema Changes

**New Table: exam_question_pool**
```sql
CREATE TABLE exam_question_pool (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, question_id)
);
```

**New Table: student_exam_questions**
```sql
CREATE TABLE student_exam_questions (
    id BIGSERIAL PRIMARY KEY,
    student_exam_id BIGINT NOT NULL REFERENCES student_exams(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    display_order INTEGER,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_exam_id, question_id)
);
```

**New Table: notifications**
```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    keycloak_user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    INDEX idx_user_notifications (keycloak_user_id, is_read, created_at)
);
```

**Update Table: exams**
```sql
ALTER TABLE exams ADD COLUMN question_pool_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE exams ADD COLUMN pool_size INTEGER;
ALTER TABLE exams ADD COLUMN questions_per_student INTEGER;
```

## Error Handling

### Soru Havuzu Hataları

1. **Yetersiz Soru**: Pool size < questions per student
   - HTTP 400: "Pool size must be greater than or equal to questions per student"

2. **Soru Atama Hatası**: Öğrenci için yeterli soru yok
   - HTTP 500: "Unable to assign questions to student"

3. **Duplicate Assignment**: Aynı öğrenciye tekrar soru atanmaya çalışılırsa
   - Return existing assignment (idempotent)

### Bildirim Hataları

1. **Bildirim Bulunamadı**: Geçersiz notification ID
   - HTTP 404: "Notification not found"

2. **Yetkisiz Erişim**: Başkasının bildirimini okumaya çalışma
   - HTTP 403: "Unauthorized access to notification"

### Zamanlayıcı Hataları

1. **Otomatik Submit Hatası**: Network problemi
   - Retry 3 kez, sonra local storage'a kaydet
   - Sayfa yenilendiğinde tekrar dene

## Testing Strategy

### Unit Tests

**QuestionPoolService Tests**
- `testAssignRandomQuestions_Success()`: Rastgele soru atama başarılı
- `testAssignRandomQuestions_AlreadyAssigned()`: Zaten atanmış sorular döndürülür
- `testAssignRandomQuestions_InsufficientQuestions()`: Yetersiz soru hatası
- `testGetAssignedQuestions()`: Atanmış soruları getir

**NotificationService Tests**
- `testNotifyNewExamPublished()`: Yeni sınav bildirimi oluştur
- `testGetUnreadCount()`: Okunmamış bildirim sayısı
- `testMarkAsRead()`: Bildirimi okundu işaretle
- `testArchiveOldNotifications()`: Eski bildirimleri arşivle

**Frontend Timer Tests**
- `testTimerWarning5Minutes()`: 5 dakika uyarısı gösterilir
- `testTimerWarning1Minute()`: 1 dakika uyarısı gösterilir
- `testAutoSubmit()`: Süre bitince otomatik submit

### Integration Tests

- Sınav oluştur → Soru havuzu ekle → Öğrenci başlat → Rastgele sorular atandı mı?
- Sınav yayınla → Bildirimler oluştu mu? → Öğrenci bildirimi gördü mü?
- Sınav başlat → 5 dakika bekle → Uyarı gösterildi mi?

## Implementation Notes

### Soru Havuzu - Rastgele Seçim Algoritması

```java
public List<Question> assignRandomQuestions(Long studentExamId) {
    StudentExam studentExam = studentExamRepository.findById(studentExamId)
        .orElseThrow();
    
    // Zaten atanmış mı kontrol et
    List<StudentExamQuestion> existing = studentExamQuestionRepository
        .findByStudentExamId(studentExamId);
    if (!existing.isEmpty()) {
        return existing.stream()
            .map(StudentExamQuestion::getQuestion)
            .collect(Collectors.toList());
    }
    
    // Havuzdan soruları al
    List<Question> poolQuestions = examQuestionPoolRepository
        .findQuestionsByExamId(studentExam.getExam().getId());
    
    // Seed-based random (aynı öğrenci her zaman aynı soruları görsün)
    long seed = studentExamId + studentExam.getExam().getId();
    Collections.shuffle(poolQuestions, new Random(seed));
    
    // İlk N soruyu seç
    int questionsPerStudent = studentExam.getExam().getQuestionsPerStudent();
    List<Question> selectedQuestions = poolQuestions.stream()
        .limit(questionsPerStudent)
        .collect(Collectors.toList());
    
    // Veritabanına kaydet
    for (int i = 0; i < selectedQuestions.size(); i++) {
        StudentExamQuestion seq = new StudentExamQuestion();
        seq.setStudentExam(studentExam);
        seq.setQuestion(selectedQuestions.get(i));
        seq.setDisplayOrder(i);
        studentExamQuestionRepository.save(seq);
    }
    
    return selectedQuestions;
}
```

### Bildirim Oluşturma

```java
public void notifyNewExamPublished(Long examId) {
    Exam exam = examRepository.findById(examId).orElseThrow();
    
    // Tüm öğrencileri bul (Keycloak'tan değil, published exam'e erişebilecek herkes)
    // Bu örnekte basit: tüm STUDENT rolüne sahip kullanıcılar
    // Gerçek implementasyonda: exam.getTargetStudents() gibi bir method olabilir
    
    List<String> studentIds = getAllStudentKeycloakIds();
    
    for (String studentId : studentIds) {
        Notification notification = new Notification();
        notification.setKeycloakUserId(studentId);
        notification.setType(NotificationType.NEW_EXAM_PUBLISHED);
        notification.setTitle("Yeni Sınav Yayınlandı");
        notification.setMessage(exam.getTitle() + " sınavı yayınlandı!");
        notification.setRelatedEntityType("EXAM");
        notification.setRelatedEntityId(examId);
        notificationRepository.save(notification);
    }
}
```

### Timer Uyarıları (Frontend)

```tsx
const TakeExam = () => {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [warnings, setWarnings] = useState({
    fiveMin: false,
    oneMin: false
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // 5 dakika uyarısı
        if (newTime === 5 * 60 && !warnings.fiveMin) {
          toast.warning('⚠️ 5 dakika kaldı!');
          setWarnings(w => ({ ...w, fiveMin: true }));
        }
        
        // 1 dakika uyarısı
        if (newTime === 60 && !warnings.oneMin) {
          toast.error('🚨 1 dakika kaldı!');
          setWarnings(w => ({ ...w, oneMin: true }));
        }
        
        // Süre bitti
        if (newTime <= 0) {
          handleAutoSubmit();
          clearInterval(timer);
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [warnings]);
  
  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'red';
    if (timeRemaining <= 5 * 60) return 'orange';
    return 'default';
  };
  
  return (
    <div>
      <div style={{ color: getTimerColor() }}>
        {formatTime(timeRemaining)}
      </div>
      {/* ... */}
    </div>
  );
};
```

## Security Considerations

1. **Soru Havuzu**: Öğrenci sadece kendi atanmış sorularını görebilir
2. **Bildirimler**: Kullanıcı sadece kendi bildirimlerini görebilir
3. **Zamanlayıcı**: Client-side manipulation'a karşı backend'de de süre kontrolü

## Performance Considerations

1. **Soru Havuzu**: Rastgele seçim O(n log n) - shuffle operation
2. **Bildirimler**: Index on (keycloak_user_id, is_read, created_at)
3. **Zamanlayıcı**: Client-side only, backend'e yük yok

## Future Enhancements

1. WebSocket ile gerçek zamanlı bildirimler
2. Email bildirimleri
3. Ses uyarıları (zamanlayıcı için)
4. Kategori bazlı rastgele seçim (her kategoriden X soru)
5. Bildirim tercihleri (hangi bildirimleri almak istiyor)

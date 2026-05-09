# Implementation Plan - Exam Enhancements

## Feature 1: Soru Havuzu Sistemi

- [ ] 1. Database ve Entity Yapısını Oluştur
  - Exam entity'sine yeni alanlar ekle (questionPoolEnabled, poolSize, questionsPerStudent)
  - ExamQuestionPool entity'sini oluştur
  - StudentExamQuestion entity'sini oluştur
  - Repository'leri oluştur
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Backend Service ve Controller Implementasyonu
  - QuestionPoolService interface ve implementation oluştur
  - assignRandomQuestions() metodunu implement et (seed-based random)
  - getAssignedQuestions() metodunu implement et
  - ExamController'a pool endpoints ekle
  - _Requirements: 1.4, 1.5_

- [ ] 3. Frontend - Sınav Oluşturma Sayfasını Güncelle
  - CreateExam'e "Soru Havuzu Modu" checkbox ekle
  - Pool size ve questions per student input alanları ekle
  - Validation ekle (poolSize >= questionsPerStudent)
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 4. Frontend - Sınav Çözme Sayfasını Güncelle
  - TakeExam'de pool-enabled kontrolü ekle
  - Öğrenciye atanmış soruları getir
  - İlk girişte rastgele atama yap
  - _Requirements: 1.4, 1.5_

- [ ] 5. Frontend - İstatistik ve Sonuç Sayfalarını Güncelle
  - ExamStatistics'te pool soruları göster
  - ExamResult'ta sadece öğrencinin sorularını göster
  - _Requirements: 1.6, 1.7_

- [ ] 6. Checkpoint - Soru Havuzu Testleri
  - Ensure all tests pass, ask the user if questions arise.

## Feature 2: Bildirim Sistemi

- [ ] 7. Database ve Entity Yapısını Oluştur
  - Notification entity'sini oluştur (type, title, message, isRead, etc.)
  - NotificationRepository oluştur
  - Index ekle (keycloak_user_id, is_read, created_at)
  - _Requirements: 2.1, 2.5_

- [ ] 8. Backend Service Implementasyonu
  - NotificationService interface ve implementation oluştur
  - notifyNewExamPublished() metodunu implement et
  - getUserNotifications() metodunu implement et
  - getUnreadCount() metodunu implement et
  - markAsRead() ve markAllAsRead() metodlarını implement et
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 9. Backend Controller Implementasyonu
  - NotificationController oluştur
  - GET /api/notifications endpoint
  - GET /api/notifications/unread-count endpoint
  - PUT /api/notifications/{id}/read endpoint
  - PUT /api/notifications/mark-all-read endpoint
  - _Requirements: 2.2, 2.3, 2.4_

- [ ] 10. ExamController'a Bildirim Entegrasyonu
  - Sınav yayınlandığında notifyNewExamPublished() çağır
  - _Requirements: 2.1_

- [ ] 11. Frontend - Navbar'a Bildirim İkonu Ekle
  - NotificationBell component oluştur
  - Okunmamış bildirim sayısını göster
  - Badge ile görsel gösterim
  - _Requirements: 2.2_

- [ ] 12. Frontend - Bildirim Listesi Sayfası
  - NotificationList page oluştur
  - Bildirimleri listele (okundu/okunmadı)
  - Bildirime tıklayınca ilgili sayfaya git
  - "Tümünü okundu işaretle" butonu
  - _Requirements: 2.3, 2.4, 2.5_

- [ ] 13. Frontend - Routing ve Navigation
  - /student/notifications route ekle
  - Navbar'dan bildirim sayfasına link
  - _Requirements: 2.3_

- [ ] 14. Checkpoint - Bildirim Sistemi Testleri
  - Ensure all tests pass, ask the user if questions arise.

## Feature 3: Sınav Zamanlayıcı Uyarıları

- [ ] 15. Frontend - Toast Notification Component
  - Toast component oluştur (info, warning, critical)
  - Auto-dismiss (5 saniye)
  - Animasyonlar ekle
  - _Requirements: 3.5_

- [ ] 16. Frontend - TakeExam Timer Uyarıları
  - Timer state'lerini ekle (showWarning5Min, showWarning1Min)
  - 5 dakika kala uyarı göster
  - 1 dakika kala uyarı göster
  - Her uyarı sadece 1 kez gösterilsin
  - _Requirements: 3.1, 3.2, 3.6_

- [ ] 17. Frontend - Timer Renk Değişimi
  - 5 dakika altında turuncu
  - 1 dakika altında kırmızı
  - CSS stilleri ekle
  - _Requirements: 3.3, 3.4_

- [ ] 18. Frontend - Otomatik Submit
  - Süre bitince otomatik submit
  - Timeout mesajı göster
  - Retry mekanizması (3 deneme)
  - _Requirements: 3.7_

- [ ] 19. Final Checkpoint - Tüm Özellikler
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Her feature bağımsız çalışabilir
- Önce backend, sonra frontend mantığıyla ilerle
- Test etmek için checkpoint'lerde dur
- Geriye dönük uyumluluk önemli (mevcut sınavlar çalışmaya devam etmeli)

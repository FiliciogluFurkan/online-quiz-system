# API & Tasarım Uyumsuzlukları

Bu doküman, **Quiz Dashboard Redesign** mockup'ları ile mevcut backend API'si arasındaki boşlukları listeler. Her madde için:

- **Ne**: Tasarımda olan ama API'de olmayan/yetersiz olan şey
- **Neden gerek**: Hangi UI öğesi bu veriye ihtiyaç duyuyor
- **Öneri**: Backend tarafında ne eklemek gerekli
- **Öncelik**: 🔴 Yüksek · 🟡 Orta · 🟢 Düşük
- **Tasarım**: ✅ Mockup'ta var · ❌ Tasarımı yok (sadece nav/kavram veya benim önerim)

İçinden istediklerini işaretle, sonra birlikte uygulayalım.

---

## ✅ Uygulanan (backend + frontend) — 2026-05-24/25

Bu turda eklendi. **Frontend de bağlandı** (commit'ler: `6be9271`, `c04f1e6`, `0938986`, `c4c525e`, `bf84500`):

- Batch A — instructor name & with-stats (StudentDashboard, InstructorDashboard, ExamResults)
- Batch B — ExamResult topic breakdown + class comparison sidebar (histogram, percentile)
- Batch C — ExamStatistics discrimination / difficulty / distractor analizi
- Batch D — ManualGrading feedback textarea + AdminDashboard activeUsers + role distribution paneli
- Batch E — AdminExamDetail owner card + audit log tablosu

Aşağıdaki endpoint/alanlar artık API'de mevcut.

| Bölüm | Eklenen |
|---|---|
| 4.1 | `User.keycloakUserId` + `UserSyncFilter` (her auth'lu istekte JWT → local users upsert) |
| 1.1 / 3.4 | `Exam.instructor` populated (yeni create + startup backfill); `Exam.createdAt` zaten vardı |
| 2.1 / 3.4 | `GET /api/exams/with-stats` → `{ exam, enrolledCount, completedCount, avgScore }` (rol bazlı) |
| 1.4 | `GET /api/results/student-exam/{id}/by-category` (konu bazlı earned/total/successRate) |
| 1.4 | `GET /api/results/exam/{examId}/aggregate` (classSize, average, median, max, min, stdDev, histogram, yourScore, yourPercentile) |
| 2.4 | `StudentExam.student` populated (yeni start + backfill) — eğitmen tablosunda gerçek isim |
| 2.5 | `discriminationIndex` (üst %27 − alt %27), `difficultyIndex`, `optionDistribution` — `/api/results/exam/{examId}/statistics` içine eklendi |
| 2.6 | `Answer.feedback` (TEXT) + `PUT /api/results/answer/{id}/grade` body'sinde `feedback` accept |
| 3.1 | `User.lastLoginAt` (UserSyncFilter günceller); `/api/admin/stats` artık `activeUsers` (son 30 gün) + `totalUsers` döndürüyor |
| 3.2 | `GET /api/admin/users/role-counts` → `{ STUDENT, INSTRUCTOR, ADMIN, total }` |
| 3.5 / 4.2 | `AuditLog` entity + `AuditLogService`; hook'lar: Exam create/update/publish/delete, Question delete, StudentExam grade. Endpoint'ler: `GET /api/admin/exams/{id}/audit-log`, sayfalı `GET /api/admin/audit-log?entityType=...&page=&size=` |

**Bağlam:** Schema migration `ddl-auto=update` ile otomatik (yeni kolonlar: `users.keycloak_user_id`, `users.last_login_at`, `answers.feedback`; yeni tablo: `audit_logs`).

---

## 1. Öğrenci (Student)

### 1.1 Exam entity'sine eklenecek alanlar
Tasarımdaki sınav kartlarında olan ama veri modelinde olmayan alanlar.

- [ ] [✅] **Ders kodu (`code`)** — 🟡 — "MAT 204" gibi mono ders kodu. `Exam.code: string`
- [x] [✅] **Eğitmen adı / sahip (`instructorName` veya `owner` ilişkisi)** — 🔴 — "Doç. Dr. Ayşe Demir" gibi. Hem öğrenci kartında hem admin tablosunda lazım. `Exam.instructor: User` veya `Exam.instructorName: string`. _Eklendi: User snapshot + Exam.instructor populated + backfill._
- [ ] [✅] **Soru sayısı (`questionCount`)** — 🟡 — Listing'de göstermek için exam endpoint'ine eklemek pratik olur. Şu an ayrı endpoint'e gitmek gerekiyor.
- [ ] [✅] **Toplam puan (`totalPoints`)** — 🟡 — Aynı sebep. Sorularla beraber hesaplanıyor.
- [ ] [✅] **Geçme barajı (`passingScore`)** — 🟢 — Tasarımda "60/100 baraj puan" gösteriliyor.
- [ ] [✅] **Deneme hakkı (`attemptsAllowed`)** — 🟡 — Şu an her sınav 1 hakla sınırlı (hardcoded). `Exam.attemptsAllowed: number`
- [ ] [✅] **Kurallar (`rules`)** — 🟢 — Tasarımdaki "Sınav koşulları" listesi. `Exam.rules: string[]` veya markdown alan.

### 1.2 Öğrenci sınav detayı (`ExamDetailStudent`)
Şu an öğrenci kart'tan **doğrudan** TakeExam'e gidiyor. Tasarımda araya bir bilgi sayfası var.

- [ ] [✅] **Yeni route**: `/student/exam/:id/preview` — 🟡 — **Frontend tarafı.** Backend'de yeni endpoint gerekmiyor; mevcut `/exams/:id` + `/exam-questions/exam/:id` yeter.
- [ ] [✅] **Soru tipi breakdown**: "Çoktan seçmeli: 18 soru · 72 puan" — 🟢 — Mevcut endpoint'ten hesaplanabilir.

### 1.3 TakeExam (sınava giriş)
- [ ] [✅] **Soru işaretleme (flag)** — 🟡 — Tasarımda "İşaretle" butonu + palette'te turuncu. `StudentExamAnswer.flagged: boolean` veya client-side state.
- [ ] [✅] **İpucu (`hint`) alanı sorularda** — 🟢 — Tasarımda question altında italik ipucu. `Question.hint?: string`.
- [ ] [✅] **Otomatik kayıt göstergesi (timestamp)** — 🟡 — "Otomatik kayıt · şimdi". İki yol: (a) `POST /student-exams/:id/save-progress` periyodik, (b) Frontend localStorage + UI gösterimi.

### 1.4 ExamResult (sonuç sayfası)
- [x] [✅] **Konu bazında performans (`topicBreakdown`)** — 🔴 — "Birinci Mertebeden DD: 8/8" gibi kategori bazlı puanlar. **Sorular kategoriye bağlı olduğu için yapılabilir.** `GET /results/student-exam/:id/by-category` _Eklendi._
- [x] [✅] **Sınıf karşılaştırması (`classComparison`)** — 🔴 — "Sınıf ortalaması 71.4, Medyan 74, En yüksek 96, Sınıf büyüklüğü 142". `GET /results/exam/:examId/aggregate` _Eklendi (average, median, max, min, stdDev, classSize, completedCount)._
- [x] [✅] **Sınıf içi sıralama (`classRank`)** — 🟡 — "Üst %18". Yukarıdaki endpoint'in içine percentile ekleyerek dönülebilir. _Eklendi: aggregate response'unda `yourPercentile`._
- [x] [✅] **Puan dağılım histogramı** — 🟡 — 12 bin'lik histogram + "SEN ↓". Aynı endpoint'ten `buckets: number[]`. _Eklendi: aggregate response'unda 10'luk `histogram.bins` + `histogram.counts`._
- [ ] [✅] **PDF olarak indir** — 🟢 — `GET /results/student-exam/:id/pdf` (server-side render).
- [ ] [✅] **Eğitmene soru sor** — 🟢 — Buton tasarımda var; mesajlaşma altyapısı gerekir.

### 1.5 MyResults (sınav geçmişi)

### 1.6 Genel öğrenci
- [ ] [✅] **Bildirim derin link (`relatedEntity`)** — 🟡 — `relatedEntityType` + `relatedEntityId` var; frontend'de tıklayınca yönlendirme yapılmıyor. (Frontend kod meselesi)
- [ ] [✅] **"Bugün açık sınavım var" hero greeting** — 🟢 — Mobile dashboard'da "Merhaba Elif, bugün 1 açık sınavın var" yazıyor. Frontend'de hesaplanabilir.

---

## 2. Eğitmen (Instructor)

### 2.1 Dashboard zenginleştirme
- [x] [✅] **Eğitmenin kendi sınavları endpoint'i** — 🟡 — `GET /exams/mine` veya `Exam.owner` ile filter. Bkz. 1.1. _Eklendi: `/exams/with-stats` rol bazlı filtreliyor (INSTRUCTOR → kendi, ADMIN → hepsi, STUDENT → published)._
- [x] [✅] **Sınav başına katılım sayısı + ortalama (`enrollmentCount`, `avgScore`)** — 🔴 — "142 öğrenci · 87 ort." Listing'de N+1 önlemek için `GET /exams/with-stats` veya enriched response. _Eklendi: `GET /api/exams/with-stats` → `{ exam, enrolledCount, completedCount, avgScore }`._
- [ ] [✅] **Sparkline veri (son 7 gün katılım)** — 🟢 — Yan panel her sınav için minik trend. `GET /results/exam/:id/daily-counts?days=7`.
- [ ] [❌] **Canlı (şu an sınava giren) öğrenci göstergesi** — 🟢 — Tasarımda yok, ben önerdim. WS / polling gerekli.

### 2.2 Soru bankası
- [ ] [❌] **Zorluk seviyesi (`difficulty`)** — 🟡 — Mockup yok, ben önerdim. `Question.difficulty: 'EASY' | 'MEDIUM' | 'HARD'`.
- [ ] [❌] **Soru kullanım sayısı (`usageCount`)** — 🟢 — Mockup yok. "Bu soru 7 sınavda kullanıldı".
- [ ] [❌] **AddQuestions'ta zorluk/popülerlik filtresi** — 🟢 — Yukarıdakilere bağlı.

### 2.3 ExamPreview / Sınav önizleme
.

### 2.4 ExamResults (sonuç tablosu)
- [x] [✅] **Öğrenci adı (anonim ID yerine)** — 🔴 — Şu an "Öğrenci #${id}" görünüyor. Eğitmen gerçek ismi görmeli. `StudentExam.student: { fullName, email }` enriched dönmeli. _Eklendi: `StudentExam.student` populated (yeni start + backfill); JSON'da nested user objesi geliyor._
- [ ] [✅] **Süre bilgisi (`timeSpent`)** — 🟡 — "Bu öğrenci 67 dakikada bitirdi". `submittedAt - startedAt`'tan hesaplanabilir.
- [ ] [❌] **CSV / Excel export** — 🟡 — Tasarımda yok ama pratik. `GET /results/exam/:id/export?format=csv`.

### 2.5 ExamStatistics (madde analizi)
- [x] [✅] **Ayırıcı güç (`discriminationIndex`)** — 🔴 — Üst %27 vs alt %27 çözüm oranı farkı. Madde analizinin kalbi. _Eklendi: `questionStatistics[].discriminationIndex`._
- [x] [✅] **Zorluk indeksi (`difficultyIndex`)** — 🟡 — Şu an `successRate` var; akademik karşılığı bu. Etiketleme meselesi. _Eklendi: `questionStatistics[].difficultyIndex` (0.0–1.0)._
- [x] [✅] **Distractor (yanıltıcı seçenek) analizi** — 🟡 — "C şıkkını seçenler: 24". `QuestionStat.optionDistribution: { A: 18, B: 6, C: 24, D: 2 }`. _Eklendi: `questionStatistics[].optionDistribution` (raw answer text → count)._

### 2.6 ManualGrading
- [ ] [✅] **Rubrik tanımı** — 🟡 — Sorunun nasıl puanlanacağı kriterleri. `Question.rubric?: string[]`.
- [x] [✅] **Öğrenciye geri bildirim/yorum** — 🔴 — `Answer.feedback?: string`. `PUT /results/answer/:id/grade` body'sine eklenir. _Eklendi: `Answer.feedback` (TEXT); grade endpoint body'sinde optional `feedback` accept ediliyor._

---

## 3. Admin

### 3.1 Dashboard KPI'ları
Mevcut `/admin/stats` sadece 4 sayı; tasarımda 6 sparkline-lı KPI var.

- [ ] [✅] **Tarihsel data (sparkline için)** — 🟡 — Her KPI için son N gün serisi. `GET /admin/stats/timeseries?metric=exams&days=30`.
- [x] [✅] **Aktif kullanıcı sayısı (`activeUsers`)** — 🔴 — "Son 30 günde giriş yapan". Şu an yok. _Eklendi: `User.lastLoginAt` (UserSyncFilter günceller); `/api/admin/stats` artık `activeUsers` + `totalUsers` döndürüyor._
- [ ] [✅] **Tamamlanma oranı (`completionRate`)** — 🟡 — `completedExams / totalStudentExams`. Frontend'de yapılabilir.
- [ ] [✅] **Sistem yükü (CPU/RAM/DB latency)** — 🟢 — Actuator endpoint'inden gelir, frontend'e proxy.

### 3.2 Dashboard sağ panel
- [x] [✅] **Rol bazlı kullanıcı sayımı** — 🔴 — "Öğrenci 1198, Eğitmen 71, Admin 15". `GET /admin/users/role-counts`. _Eklendi._
- [ ] [✅] **Sistem health endpoint'i** — 🟡 — DB ping, Auth ping, Storage. Actuator'u güvenli expose et: `GET /admin/health`.

### 3.3 Aktivite grafiği
- [ ] [✅] **Günlük oturum sayısı** — 🟡 — 30 günlük bar chart. Timeseries endpoint'iyle birleşebilir.

### 3.4 Sınavlar tablosu (admin)
- [x] [✅] **Eğitmen adı** — 🔴 — Bkz. 1.1. _Eklendi (1.1 ile birlikte)._
- [x] [✅] **Katılım sayısı / quota** — 🔴 — "142 / 168". Bkz. 2.1. _Eklendi (`/exams/with-stats` ile)._
- [x] [✅] **Oluşturulma tarihi** — 🔴 — `Exam.createdAt: timestamp`. Audit field. _Zaten mevcut (`Exam.createdAt`)._
- [ ] [✅] **Durum (live/upcoming/draft/graded)** — 🟡 — Sadece `published` var. Computed enum.
- [ ] [✅] **Sahip değiştirme / sahibe bildir** — 🟢 — "Sahibe bildir" butonu var.

### 3.5 AdminExamDetail
- [x] [✅] **Audit log** — 🔴 — Yeni entity: `AuditLog { entityType, entityId, userId, action, payload, timestamp }`. `GET /admin/exams/:id/audit-log`. Hem instructor hem admin için faydalı. _Eklendi: `AuditLog` entity + service; hook'lar: Exam create/update/publish/delete, Question delete, StudentExam grade. Endpoint'ler: `GET /api/admin/exams/{id}/audit-log` + sayfalı `GET /api/admin/audit-log?entityType=...`._
- [x] [✅] **Owner kartı** — 🔴 — Bkz. 1.1. Eğitmen + öğrenci sayısı. _Backend hazır (instructor + enrolledCount); frontend bağlanmadı._
- [ ] [✅] **Veri bütünlüğü check'leri** — 🟡 — "Soru referansları 25/25, çakışan teslimler 0". `GET /admin/exams/:id/integrity`.
- [ ] [✅] **Tehlikeli alan / impact analizi** — 🟡 — Silme öncesi etkilenecek kayıt sayısı. `GET /admin/exams/:id/delete-impact`.
- [ ] [✅] **JSON dışa aktar** — 🟢 — `GET /admin/exams/:id/export`.

### 3.6 Kullanıcı yönetimi (TAMAMEN EKSİK)
Admin nav'da "Kullanıcılar" yazıyor ama mockup yok.

- [ ] [❌] **`GET /admin/users`** — 🔴
- [ ] [❌] **`GET /admin/users/:id`** — 🟡
- [ ] [❌] **`PUT /admin/users/:id/roles`** — 🟡 — Keycloak entegrasyonu gerekir.
- [ ] [❌] **`PUT /admin/users/:id/active`** — 🟡
- [ ] [❌] **`POST /admin/users/invite`** — 🟢
- [ ] [❌] **`GET /admin/users/:id/activity`** — 🟢

### 3.7 Sistem / ayarlar (TAMAMEN EKSİK)
Admin nav'da "Sistem" yazıyor ama mockup yok.

- [ ] [❌] **Sistem ayarları** — 🟢
- [ ] [❌] **Backup tetikleme** — 🟢
- [ ] [❌] **Cache flush / re-index** — 🟢

---

## 4. Çapraz konular

### 4.1 User entity
- [x] [✅] **Backend'de cache/snapshot `User` tablosu** — 🔴 — Mockup'larda User adı/avatar/rol her yerde gözüküyor (TopBar, ExamResults tablosu, AdminExamDetail owner kartı). Keycloak'tan periyodik veya ilk sign-in'de oluşturulan local user kaydı: `id, keycloakUserId, fullName, email, roles, active, createdAt`. **En yüksek değerli ekleme.** _Eklendi: `User.keycloakUserId` + `UserSyncService` + `UserSyncFilter` her auth'lu istekte idempotent upsert. JWT claims'ten `sub`, `email`, `name`/`given_name`/`family_name`, realm rolü yansıtılıyor._

### 4.2 Audit / activity log
- [x] [✅] **`AuditLog` entity + endpoint'ler** — 🟡 — AdminExamDetail audit log'u tasarımda var. Tek altyapı tüm rollere fayda sağlar. _Eklendi (bkz. 3.5)._

### 4.3 Pagination
- [ ] [❌] **Pageable response standardı** — 🟡 — Tasarım kararı değil, teknik gereklilik. Şu an `List` dönüyor; 1000+ kayıt için sorun.

### 4.4 WebSocket / real-time
- [ ] [❌] **WebSocket altyapısı** — 🟢 — Tasarımda "live dot" var ama özel real-time UI yok. Lüks.

---

## Önerim — Sıralama

Eğer sınırlı zaman/efor varsa, sırayla bunlardan başla (hepsi tasarımı olan, yüksek öncelikli maddeler):

1. ✅ 🔴 **User snapshot tablosu + enriched response'lar** (4.1) — Sayısız yerde fayda
2. ✅ 🔴 **`Exam.createdAt` + `Exam.instructor`** — Admin tablosu ve instructor dashboard hemen zenginleşir
3. ✅ 🔴 **`/results/exam/:id/aggregate` (sınıf karşılaştırması)** — Öğrencinin sonuç sayfası açılır
4. ✅ 🔴 **Konu bazlı performans (`/results/.../by-category`)** — Sorular kategoriye bağlı olduğu için yapılabilir
5. ✅ 🔴 **`Exam.aggregates` (enrolledCount, avgScore)** — Instructor dashboard'da hemen değer

**Tüm 🔴 öncelikli + tasarımda olan maddeler bitirildi. Bundan sonraki adım:** frontend tarafında yeni endpoint/alanları bağlamak.

## Kalan iş (öncelik sırasına göre)

🟡 Orta:
- 1.1 `Exam.code`, `questionCount`, `totalPoints`, `attemptsAllowed`
- 1.2 `/student/exam/:id/preview` (frontend route)
- 1.3 Soru flag (`StudentExamAnswer.flagged`), autosave endpoint
- 1.6 Bildirim derin link (frontend)
- 2.1 Sparkline `daily-counts` endpoint
- 2.4 Süre bilgisi (`timeSpent`) — `submittedAt - startedAt`
- 2.6 Rubrik (`Question.rubric`)
- 3.1 Tarihsel KPI timeseries, completionRate
- 3.2 Sistem health
- 3.3 Günlük oturum sayısı
- 3.4 Sınav durumu enum, sahip değiştirme
- 3.5 Integrity / delete-impact endpoint'leri

🟢 Düşük: 1.1 `passingScore`/`rules`, 1.2 soru tipi breakdown, 1.3 `Question.hint`, 1.4 PDF + mesajlaşma, 1.5 sparkline, 1.6 hero greeting, 3.5 JSON export.

❌ Tasarımı olmayan / scope dışı: 2.1 canlı gösterge, 2.2 difficulty/usageCount/tags, 2.4 CSV export, 3.6 kullanıcı yönetimi (Keycloak admin entegrasyonu gerekli), 3.7 sistem ayarları, 4.3 pagination standardı, 4.4 WebSocket.

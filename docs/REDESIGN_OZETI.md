# QuizLab — Redesign & Durum Özeti

> Bu dosya, bu oturumda yapılanları, **bilinçli olarak bıraktıklarımızı** ve
> **yapılacakları** özetler. Sunum + rapor hazırlığı için referans niteliğindedir.
> Son güncelleme: 2026-06-03 · Branch: `yetb`

---

## 1. Bu oturumda ne yaptık?

### 1.1 Git / kurulum
- `main` (architecture merge) + `alper_branch` (TEST_RAPORU düzeltmeleri) **`yetb`'de birleştirildi** (çakışmasız).
- Windows/WSL **CRLF sorunu** çözüldü; `.gitattributes` ile **LF** standardı kondu.
- Dokümanlar düzenlendi: `docs/{alperdocs, omerdocs, yetdocs}`.
- Kök `.gitignore` eklendi (`.claude/`).
- **Build doğrulaması:** backend (`mvnw compile`, Java 25) ve frontend (`tsc + vite build`) **yeşil**.

### 1.2 Tasarım sistemi (kod tarafı)
Stitch'te oluşturulan **"QuizLab / Academic Precision"** tasarımı koda taşındı:
- **Renk:** zemin `#f8f9ff`, kart `#ffffff`, kenarlık `#e2e8f0`, mürekkep `#0b1c30`,
  **navy `#1e3a8a`** (birincil), **indigo `#4f46e5`** (vurgu).
- **Tipografi:** tek aile **Manrope** (serif kaldırıldı).
- **`academic-ui.tsx`:** ortak tokenlar + **role-aware `Sidebar` + `AppShell`**
  (global üst menü yerine sol sidebar; Home ve Sınav Çözme ekranlarında gizli).

### 1.3 Stitch tasarımına **birebir** geçirilen sayfalar
| Sayfa | Dosya |
|---|---|
| Landing (Home) | `pages/Home.tsx` |
| Eğitmen Paneli | `pages/InstructorDashboard.tsx` |
| Öğrenci Paneli | `pages/StudentDashboard.tsx` |
| Admin Paneli | `pages/AdminDashboard.tsx` |
| Soru Bankası | `pages/QuestionBank.tsx` |
| Sınav Detay | `pages/ExamDetail.tsx` |
| Yeni Sınav Oluştur | `pages/CreateExam.tsx` |
| Kategoriler | `pages/CategoryManagement.tsx` (Stitch'siz, sisteme uyumlu) |
| Sınav İstatistikleri | `pages/ExamStatistics.tsx` |
| Sınav Çözme | `pages/TakeExam.tsx` |
| Sınav Sonucu | `pages/ExamResult.tsx` |

> Tüm sayfalarda **veri akışı ve iş mantığı korundu** (hook'lar, API çağrıları,
> validasyonlar, submit, timer, auto-save vb.); yalnızca sunum değişti.
> Her sayfa `npm run build`'den temiz geçti.

### 1.4 Tasarım referansları
Stitch çıktıları repoda: `design/` (her ekran için `screen.png`, bazılarında `code.html`)
ve `design/DESIGN.md` (tema spesifikasyonu).

---

## 2. Bilinçli olarak BIRAKTIKLARIMIZ

### 2.1 Exact-match yapılmayan sayfalar (yeni stille tutarlı ama Stitch'e birebir değil)
- Manuel Puanlama (`ManualGrading.tsx`)
- Toplu İçe Aktar (`BulkImport.tsx`)
- Sonuçlarım (`MyResults.tsx`)
- Bildirimler (`NotificationList.tsx`)
- Admin Sınav Detay (`AdminExamDetail.tsx`)

### 2.2 Keycloak login teması
Giriş ekranı React değil, **Keycloak teması** (`backend/keycloak-theme/...`, FTL+CSS).
Tasarımı Stitch'te hazır ama henüz temaya uygulanmadı.

### 2.3 Arayüzde var, backend'i sonra bağlanacak alanlar
Felsefe: *"Ekranda olması gereken öğeyi koy, işlevini sonra yaz."*
- **Soru Sayısı** sütunu (Eğitmen tablosu) — `with-stats` endpoint'i bu alanı döndürmüyor (`questionCount` opsiyonel, gelince dolacak).
- **"Soruları rastgele sırala"** toggle (Yeni Sınav) — local state, backend alanı yok.
- **Geçme Oranı** + **Puan Dağılımı histogramı** (İstatistikler) — endpoint döndürmüyor.
- **Ayarlar** menü öğesi (sidebar) — sayfası henüz yok (placeholder).

---

## 3. Bilinen sorunlar / demo notları

- **Süresi geçmiş sınav = boş ekran sanılabilir.** Öğrenci sınav çözme/submit ve
  manuel puanlama, sınavın **aktif zaman penceresi** içinde olmasını gerektirir
  (Alper'in eklediği doğru validasyon). **Demo için: geniş pencereli (başlangıç=şimdi,
  bitiş=çok ileri) yeni bir sınav oluştur**, sonra öğrenciyle çöz → submit → puanla.
- Notification kırmızı noktası gerçek "okunmamış" sayısına bağlı.

---

## 4. Yapılacaklar (öncelik sırasıyla)

### 4.1 Dokümantasyon (demo + rapor eşit ağırlık — öncelikli)
- [ ] **SRS güncelle:** "Planned" sanılan ama artık var olan özellikler (Admin paneli,
      ManualGrading, ExamStatistics, Notification, AuditLog, QuestionPool) → "Implemented".
- [ ] **SDD** (Software Design Document) — mimari, veri modeli, sequence diyagramları.
- [ ] **Test Raporu** — `docs/alperdocs/TEST_RAPORU.md` iyi temel; güncel ekran görüntüleriyle.
- [ ] **GenAI Promptları** dokümanı (ödev gereksinimi).
- [ ] `PROJECT_OVERVIEW.md` "current snapshot" güncelle (3-commit'lik eski hali anlatıyor).
- [ ] Stale `README.md` ve `KEYCLOAK_SETUP.md` dosya adı uyumsuzluğu.

### 4.2 Kod
- [ ] Placeholder alanları backend'e bağla (Soru Sayısı, randomize, Geçme Oranı, histogram).
- [ ] Kalan 5 sayfayı exact-match yap (opsiyonel).
- [ ] Keycloak login temasını QuizLab tasarımına çevir (opsiyonel).
- [ ] Demo öncesi: geniş pencereli test sınavıyla **uçtan uca akışı doğrula**
      (oluştur → yayınla → çöz → submit → manuel puanla → sonuç → istatistik).

### 4.3 Sunum
- [ ] Demo senaryosu (happy path) belirle ve prova et.
- [ ] Kurulum tekrarlanabilirliği: `compose.yaml` `quiz-realms.json`'ı otomatik import
      etmiyor; seed script (`backend/scripts/seed-keycloak-users.sh`) ile kullanıcılar
      (`admin/admin123`, `instructor/instructor123`, `student/student123`).

---

## 5. Hızlı çalıştırma

```bash
# Altyapı (WSL veya PowerShell, Docker gerekli)
cd backend && docker compose up -d
bash scripts/seed-keycloak-users.sh   # test kullanıcıları

# Backend (PowerShell)  → http://localhost:8080
cd backend && ./mvnw spring-boot:run

# Frontend (PowerShell) → http://localhost:5173
cd frontend && npm install && npm run dev
```

> Not: Bu repoda **git WSL üzerinde**, **uygulama PowerShell üzerinde** çalıştırılıyor.

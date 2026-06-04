# QuizLab — Sohbet Devir Notu (Handover)

> **Yeni sohbete bu dosyayı okutarak başla.** Önceki sohbetin tüm bağlamını,
> çalışma tarzını, mevcut durumu ve sıradaki işi özetler.
> Tarih: 2026-06-04 · Branch: `yetb`

---

## 1. Çalışma tarzım / alışkanlıklarım (bunlara göre davran)

- **Dil:** Türkçe konuşuyoruz.
- **Git WSL'de, uygulama PowerShell'de.** Git komutlarını bana **WSL/bash** sözdizimiyle
  ver (multi-line commit mesajı için `git commit -F - <<'EOF' … EOF`; PowerShell here-string
  `@'…'@` verme — bash'te başa `@` sızıyor). Sen (asistan) Windows tarafından git çalıştırma
  (CRLF/identity sorunu). Repo **LF** standardında (`.gitattributes`).
- **Tasarım:** Sayfaları Stitch tasarımlarına **birebir** istiyorum. `code.html` olmayan
  sayfalarda **benden HTML iste**, ben yapıştırırım. Tasarım referansları `design/` altında.
- **Toplu iş yap, beni tek tek uğraştırma** (ör. seed verisi, çoklu sayfa).
- **Kararları önce konuşalım**, sonra uygula. Önemli mimari kararları **takımla** konuşacağım.
- **"Ekranda olması gereken öğeyi koy, backend'i yoksa işlevini sonra yaz"** — placeholder kabul.
- Her kod değişikliğinden sonra **`npm run build` ile doğrula** (build yeşil olmalı).
- Build/uzun işleri **arka planda** çalıştır, beni bekletme.

## 2. Bu sohbette ne yaptık?

1. **Branch birleştirme:** `main` + `alper_branch` → `yetb` (çakışmasız). `.gitattributes` (LF),
   doküman düzeni (`docs/{alperdocs,omerdocs,yetdocs}`), `.gitignore`. Backend+frontend build yeşil.
2. **Tasarım (Stitch → kod):** `academic-ui.tsx`'e yeni tokenlar (navy/Manrope) + **role-aware
   Sidebar/AppShell**. **11 ekran birebir** yeniden örüldü: Landing, Eğitmen/Öğrenci/Admin paneli,
   Soru Bankası, Sınav Detay, Yeni Sınav, Kategoriler, Sınav İstatistikleri, Sınav Çözme, Sınav Sonucu.
   (Push'lanmış commit: `792f21f`.)
3. **Keycloak login teması:** `backend/keycloak-theme/quiz-theme/login/login.ftl` (split layout).
   Uygulamak için: Keycloak admin → quiz-realm → Realm settings → Themes → Login theme = `quiz-theme`.
4. **SRS güncellendi** (`docs/yetdocs/SRS.md`): Planned/Partial → Implemented (admin, manuel puanlama,
   istatistik, bildirim, audit log, soru havuzu vb.); yeni FR'lar (bildirim, toplu import, PDF).
5. **Alper'in test raporu** incelendi → ~40 bulgunun ~30+'ı düzeltilmiş; kalan açıklar cila/UX.
6. **Hazır test verisi** DB'ye eklendi (3 kategori + 12 soru). Not: Windows git-bash, komut
   argümanında UTF-8'i bozuyor; veri **WSL/heredoc(stdin)** ile eklendi. Seed scripti
   `backend/scripts/seed-test-data.sh` (argv sürümü Windows'ta Türkçe için bozuk; Linux/WSL'de çalışır
   ya da heredoc'a çevrilmeli).

## 3. Mevcut durum (DİKKAT: commit edilmemiş değişiklikler var)

`792f21f` (push'lu) sonrası şunlar **henüz commit edilmedi**:
- `backend/keycloak-theme/quiz-theme/login/login.ftl` (yeni login teması)
- `docs/yetdocs/SRS.md` (güncellemeler)
- `docs/REDESIGN_OZETI.md` (§5.1 açık karar)
- `docs/HANDOVER.md` (bu dosya)
- `backend/scripts/seed-test-data.sh`

**Yeni sohbete geçmeden commit et (WSL'de):**
```bash
cd /mnt/c/dev/online-quiz-system
git add -A
git commit -F - <<'EOF'
docs+keycloak: SRS update, login theme, handover & seed script

- SRS: reflect implemented features + new FRs
- Keycloak split-layout login.ftl
- REDESIGN_OZETI: open decision on student-exam access
- seed-test-data.sh + HANDOVER.md
EOF
git push
```

## 4. Sınıf + Enrollment + Sınav Atama — ✅ UYGULANDI + CANLI DOĞRULANDI (2026-06-04)

Karar: **MVP · Hibrit görünürlük · Katılım kodu · M:N atama**. Detay `docs/REDESIGN_OZETI.md` §5.1.

**Backend (build yeşil):**
- Entity: `Classroom`, `Enrollment`, `ExamAssignment`; `Exam.visibility` (PUBLIC|CLASSES, default PUBLIC).
- Repo: Classroom/Enrollment/ExamAssignment repository'leri.
- `ClassroomService`: 6 haneli benzersiz katılım kodu, erişim süzme/guard, bildirim hedefleme.
- `ClassroomController` (`/api/classrooms`): create/list/detail/update/delete, `DELETE .../enrollments/{id}`,
  `POST /join`, `GET /my`.
- `ExamController`: `GET|PUT /exams/{id}/assignments`; `/exams/published` öğrenciye göre süzülür;
  `deleteExam` atamaları temizler.
- `StudentExamController.startExam`: CLASSES sınavında kayıtsız öğrenciyi reddeden guard.
- `NotificationService.notifyNewExamPublished`: CLASSES → atanan sınıf öğrencileri, PUBLIC → herkes.
- `ExamVisibilityBackfill`: eski sınavlarda null görünürlüğü PUBLIC'e çeker.

**Frontend (build yeşil):**
- Yeni sayfalar: `InstructorClasses.tsx` (`/instructor/classes`), `ClassDetail.tsx`
  (`/instructor/classes/:id`), `StudentClasses.tsx` (`/student/classes`).
- `ExamDetail.tsx`: "Görünürlük & Sınıflar" paneli (radio + sınıf çoklu-seçim + kaydet).
- `academic-ui.tsx` sidebar: eğitmen ve öğrenci için "Sınıflarım".
- `types.ts`: `ExamVisibility`, `Classroom`, `ClassroomRow`, `ClassMember`, `EnrolledClass`.

**SRS (`docs/yetdocs/SRS.md`):** FR-018/019 güncellendi; §3.11 (FR-048…FR-054); UC-019…UC-021; traceability.

**Karar:** Yeni sınav varsayılan görünürlüğü `PUBLIC` (geri uyumlu); kategori ≠ sınıf.

**Canlı doğrulama (2026-06-04):** Uçtan uca akış denendi ve **çalışıyor** — sınıf oluştur → kod →
öğrenciyle katıl → sınava CLASSES atan → öğrenci yalnız atananı görür. Build + canlı akış yeşil.

> **Önemli operasyon notu:** Backend'de `spring-boot-devtools` YOK → kod değişince **otomatik
> reload olmaz**. Yeni controller/entity ekledikten sonra çalışan `spring-boot:run` sürecini
> **elle yeniden başlat** (Ctrl+C → `.\mvnw spring-boot:run`); yoksa eski kod servis edilir
> ("Sınıf oluşturulurken hata oluştu" gibi). Yeni tablolar (`classrooms`, `enrollments`,
> `exam_assignments`) ve `exams.visibility` kolonu açılışta `ddl-auto=update` ile oluşur.

## 5. Diğer açık işler (future work / cila)

- Test raporundan kalan açıklar: duplicate soru kontrolü, MC şık formatı doğrulama,
  server-clock senkronizasyonu (tarayıcı saati), loading skeleton, tarih/saat global helper,
  `alert()` → Toast geçişi, eğitmene-soru-sor mailto→in-app.
- 5 ekran exact-match değil: Manuel Puanlama, Bulk Import, MyResults, Bildirimler, AdminExamDetail.
- Backend'e bağlanacak placeholder UI: Soru Sayısı (instructor tablosu), randomize toggle,
  Geçme Oranı + Puan Dağılımı histogramı (istatistik).
- Teslim dokümanları: SDD (başkalarına devredildi), Test Raporu (güncel ekranlarla), GenAI promptları.

## 6. Önemli teknik notlar

- **Kurulum:** `cd backend && docker compose up -d` (Postgres+Keycloak), `bash scripts/seed-keycloak-users.sh`
  (kullanıcılar: admin/admin123, instructor/instructor123, student/student123),
  `./mvnw spring-boot:run` (8080), `npm run dev` (5173), Keycloak 8180 (admin/admin).
- **Realm import:** compose `quiz-realms.json`'ı otomatik import etmiyor; realm elle/varsa mevcut.
- **Demo/test:** Süresi geçmiş sınav boş görünür → **geniş pencereli (başlangıç=şimdi, bitiş=ileri)
  sınav** oluştur. Hazır 12 soru + kategoriler DB'de mevcut (compose'da volume yok → `docker compose
  down` sıfırlar; `restart` korur).
- **Seed/API otomasyonu:** Backend Windows host'ta (8080), WSL localhost ile erişemez; WSL'den
  Türkçe gövdeli POST için **heredoc(stdin)** kullan, argv'den UTF-8 gönderme.

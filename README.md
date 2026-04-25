# Online Quiz ve Sınav Sistemi

## Kurulum

### Backend (Spring Boot)

1. PostgreSQL'i başlatın:
```bash
cd backend
docker compose up -d
```

2. Backend'i çalıştırın:
```bash
./mvnw spring-boot:run
```

Backend http://localhost:8080 adresinde çalışacak.

### Frontend (React)

1. Bağımlılıkları yükleyin:
```bash
cd frontend
npm install
```

2. Frontend'i başlatın:
```bash
npm run dev
```

Frontend http://localhost:5173 adresinde çalışacak.

## Teknolojiler

- Backend: Spring Boot 4.0.6, PostgreSQL, JPA
- Frontend: React 19, TypeScript, Vite, React Router
- Database: PostgreSQL 16

## Yapı

### Backend Entities
- User (Öğrenci, Eğitmen, Admin)
- Category (Soru kategorileri)
- Question (Sorular)
- Exam (Sınavlar)
- StudentExam (Öğrenci sınav kayıtları)
- Answer (Cevaplar)

### Frontend Pages
- Home (Ana sayfa)
- StudentDashboard (Öğrenci paneli)
- InstructorDashboard (Eğitmen paneli)

## Sonraki Adımlar

- [ ] Keycloak entegrasyonu
- [ ] WebSocket ile gerçek zamanlı iletişim
- [ ] Sınav alma ekranı
- [ ] Soru bankası yönetimi
- [ ] Raporlama ve analitik

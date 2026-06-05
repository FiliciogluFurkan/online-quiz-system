# Online Quiz and Exam System - Project Overview

## Purpose

Online Quiz and Exam System is a web-based assessment platform for managing the full lifecycle of digital quizzes and exams. The project aims to help instructors create question banks, configure exams, deliver exams to students, collect answers, grade objective questions, and review results.

The project is developed for CSE 444 - Software Engineering II. Documentation is part of the expected deliverables, alongside the SRS, SDD, source code, executables, test procedures, test reports, and GenAI prompts.

## Problem Context

Digital assessment systems must support reliable, fair, and flexible evaluation. Instructors need reusable question banks, multiple question types, exam time windows, grading workflows, and result reporting. Students need a clear exam-taking experience that avoids data loss and provides understandable feedback.

The broader project vision includes:

- Question bank management with categories.
- Multiple question types such as multiple choice, true/false, and short answer.
- Flexible exam configuration with duration, availability windows, publication status, and optional randomization.
- Automatic grading for objective questions.
- Manual review support for subjective answers.
- Result reporting and analytics for instructors.
- Authentication and role-based access for students and instructors.
- Reliability concerns such as session handling and future auto-save behavior.
- Academic integrity concerns such as randomized delivery and possible future monitoring/proctoring.

## Current Implementation Snapshot

The current `main` branch contains a Spring Boot backend and a React/Vite frontend.

### Backend

Location: `backend/`

Main technologies:

- Java 25
- Spring Boot 4.0.6
- Spring Web MVC
- Spring Data JPA
- Spring Security
- OAuth2 Resource Server / JWT validation
- PostgreSQL
- Docker Compose for PostgreSQL and Keycloak

Important backend areas:

- `entity/`: domain model for users, categories, questions, exams, exam-question links, student exams, and answers.
- `repository/`: JPA repositories for persistence.
- `controller/`: REST endpoints for exams, questions, exam questions, student exams, answers, and results.
- `service/GradingService.java`: automatic grading for multiple-choice and true/false answers.
- `config/SecurityConfig.java`: CORS, JWT resource server, and method security configuration.
- `config/DataInitializer.java`: creates local test users if the database is empty.

### Frontend

Location: `frontend/`

Main technologies:

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Keycloak JS
- Lucide React

Important frontend areas:

- `src/App.tsx`: route definitions.
- `src/context/AuthContext.tsx`: Keycloak initialization and auth state.
- `src/api/axios.ts`: API client with bearer token injection.
- `src/components/Navbar.tsx`: shared navigation.
- `src/pages/`: home page, student dashboard, instructor dashboard, exam creation, exam detail, question bank, exam-taking, and result pages.

## User Roles

### Student

Students can view published exams, start or continue an exam, submit answers, and view their results.

Current pages:

- `/student`
- `/student/exam/:id`
- `/student/result/:studentExamId`

### Instructor

Instructors can create exams, manage questions, add questions to exams, publish exams, and inspect results.

Current pages:

- `/instructor`
- `/instructor/create-exam`
- `/instructor/exam/:id`
- `/instructor/exam/:id/add-questions`
- `/instructor/exam/:id/results`
- `/instructor/questions`
- `/instructor/result/:studentExamId`

### Admin

The project documents and code mention admin as a possible role, but the current UI and backend behavior mainly focus on student and instructor flows.

## Domain Model

Core entities:

- `User`: local user record with email, full name, role, active status, and timestamps.
- `Category`: question category.
- `Question`: question text, type, options, correct answer, points, category, and Keycloak creator id.
- `Exam`: title, description, instructor, Keycloak instructor id, duration, start/end time, randomization flag, publication flag, and creation timestamp.
- `ExamQuestion`: join entity between exams and questions with an order index.
- `StudentExam`: a student's attempt for an exam, including status, score, timestamps, and Keycloak user id.
- `Answer`: submitted answer for a question inside a student exam, including correctness and earned points.

## Authentication and Authorization

Keycloak is used for authentication.

Current local Keycloak settings:

- Keycloak URL: `http://localhost:8180`
- Realm: `quiz-realm`
- Frontend client: `quiz-frontend`
- Backend resource server validates JWT tokens from the realm.
- Test users documented in the setup guide:
  - `student` / `student123`
  - `instructor` / `instructor123`

Important implementation detail:

The application currently uses both Keycloak identities and a local `User` table. Some records store `keycloakUserId`, `keycloakInstructorId`, or `keycloakCreatorId`. Future changes should be careful not to mix local numeric user IDs with Keycloak subject IDs.

## Current Git History Summary

The visible history on `main` contains three commits:

- `66e2b86 first commit`: initial backend/frontend structure, core entities, repositories, simple controllers, base pages, and setup files.
- `922be3c`: instructor/admin UI improvements, question bank, exam detail, add-questions flow, and exam-question backend support.
- `9657a2d`: student exam flow, results pages, answer/result APIs, grading service, Keycloak integration, auth context, navbar, and setup documentation.

At the time this document was created, `yetb`, `main`, and `origin/main` pointed to the same commit.

## Local Development

### Backend and Infrastructure

Start PostgreSQL and Keycloak:

```bash
cd backend
docker compose up -d
```

Run the backend:

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

Keycloak runs on:

```text
http://localhost:8180
```

### Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Run the frontend:

```bash
cd frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Known Gaps and Attention Points

- Existing root documentation has broken Turkish characters and should be rewritten or re-encoded.
- `README.md` is stale: it lists Keycloak, exam-taking, question bank management, and reporting as future work even though parts of these are now implemented.
- `KEYCLOAK_SETUP.md` mentions `backend/keycloak-realm-export.json`, while the repository currently contains `backend/realm-export.json`.
- `SecurityConfig.java` currently permits many `/api/**` endpoints for testing. This is risky for a real deployment and should be tightened before final submission.
- Some controller methods rely on `SecurityUtils.getCurrentUserId()`, but fallback behavior may expose broader data when there is no authenticated user.
- Objective grading exists for multiple-choice and true/false questions. Short-answer/manual grading is still a future or incomplete workflow.
- WebSocket dependency exists, but real-time exam features such as auto-save, notifications, or monitoring are not clearly implemented yet.
- Reporting exists at a basic results level, but analytics such as question-level statistics and cohort trends are not yet fully developed.
- Proctoring and anti-cheating features are part of the project vision, but current implementation mainly supports publication status and optional question randomization.

## Development Guidelines

- Keep student, instructor, and admin responsibilities clearly separated.
- Treat Keycloak subject IDs and local database IDs as different identity concepts.
- Avoid adding business logic directly into large frontend pages when it can be isolated into API helpers, hooks, services, or backend services.
- Add or update documentation whenever changing setup, authentication, routing, database assumptions, or deliverable-related behavior.
- Before changing authorization rules, verify both frontend route behavior and backend endpoint protection.
- Before changing exam submission or grading behavior, test the full flow: create exam, add questions, publish exam, take exam, submit answers, grade, and view results.
- Preserve the assignment deliverables: SRS, SDD, source code/executables, test procedures, test reports, and GenAI prompts.

## Suggested Next Documentation Files

After this overview, the project would benefit from:

- `docs/SRS.md`: software requirements specification with use cases.
- `docs/SDD.md`: software design document with architecture, data model, and sequence diagrams.
- `docs/TEST_PROCEDURES.md`: manual and automated test procedures.
- `docs/TEST_REPORT.md`: executed test results and known failures.
- `docs/GENAI_PROMPTS.md`: prompts and AI usage notes required by the assignment.
- `AGENTS.md` or `docs/CODEX_GUIDE.md`: project-specific instructions for Codex agents if the team continues using Codex for implementation and documentation.

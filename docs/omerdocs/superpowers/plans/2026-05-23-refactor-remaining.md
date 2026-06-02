# Online Quiz System — Refactor (Remaining) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the remaining 6 refactor commits identified in the code review, each as a single focused git commit.

**Architecture:** Spring Boot 4 / Java 17 backend (REST, JPA/Hibernate, Keycloak JWT), React 19 / TypeScript frontend (Vite, React Router, Axios, Keycloak-JS). No test infrastructure exists — use `./mvnw -q compile` and `npm run build` for verification. Add `@Transactional` service methods for atomicity. Keep changes minimal; no unrelated cleanup.

**Tech Stack:** Spring Boot 4, Java 17, PostgreSQL, Keycloak 23, React 19, TypeScript, Axios, keycloak-js

**Branch:** `architecture`

---

## Current State (After Completed Commits)

```
4058ffc  security: lock down API authorization and hide answer keys
c79a586  chore(backend): downgrade Java target to 17
```

The security commit already added:
- `SecurityUtils.hasAnyRole()` helper
- `@JsonIgnore` on `Question.correctAnswer`
- `@PreAuthorize` on mutating endpoints
- Ownership checks in `AnswerController`, `ResultController`, `StudentExamController`
- Credentials externalized to env vars in `application.properties`

---

## Files Overview

| Task | File(s) |
|------|---------|
| 1 — Exam Submit Atomicity | `StudentExamController.java` (new `/submit`), `TakeExam.tsx` |
| 2 — Frontend Auth/Guards | `AuthContext.tsx`, `App.tsx`, new `ProtectedRoute.tsx`, `axios.ts`, `Navbar.tsx` |
| 3 — DTO + Exception Handler | new `dto/` package, new `exception/` package, `ExamQuestionController.java`, `QuestionPoolController.java` |
| 4 — User Entity Consolidation | `DataInitializer.java`, `User.java`, `StudentExam.java` (cleanup only) |
| 5 — Performance | `AdminController.java`, `StudentExamRepository.java`, `ResultController.java` → `ResultService.java` (new), `NotificationService.java` |
| 6 — Frontend Decomposition | `AdminDashboard.tsx` → split + `useAdminDashboard.ts`, `Navbar.tsx` hover fix |

---

## Task 1: Exam Submit Atomicity + MCQ Convention

**Commit message:** `feat(backend): atomic exam submission endpoint`

**Problem:** `TakeExam.tsx` currently fires N sequential POST /answers + PUT /student-exams/{id} + POST /results/grade/{id}. A network drop mid-loop leaves partial answers with no SUBMITTED state. All three operations must be a single atomic transaction.

**MCQ convention note:** `TakeExam.tsx` sends `option.charAt(0)` (i.e. `"A"`, `"B"`) as the answer. `GradingService.checkAnswer()` does string equality. This only works if instructors store `correctAnswer` as `"A"` / `"B"` / etc. — verify this convention is consistent in your question creation UI before deploying. No code change is required if the convention is already followed.

### Files

- **Modify:** `backend/src/main/java/cse/quiz/system/controller/StudentExamController.java`
- **Modify:** `frontend/src/pages/TakeExam.tsx`

---

- [ ] **Step 1 — Add submit DTO record to StudentExamController**

Open `backend/src/main/java/cse/quiz/system/controller/StudentExamController.java`.

Add the following imports at the top (after existing imports):

```java
import cse.quiz.system.entity.Answer;
import cse.quiz.system.repository.AnswerRepository;
import cse.quiz.system.repository.QuestionRepository;
import cse.quiz.system.service.GradingService;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
```

Add the missing repository injections. Change the class fields to:

```java
@RestController
@RequestMapping("/api/student-exams")
@RequiredArgsConstructor
public class StudentExamController {
    private final StudentExamRepository studentExamRepository;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final GradingService gradingService;
```

- [ ] **Step 2 — Add the `/submit` endpoint**

Add the following method inside `StudentExamController`, before the closing `}`:

```java
@PostMapping("/{id}/submit")
@Transactional
public Map<String, Object> submitExam(
        @PathVariable Long id,
        @RequestBody Map<String, String> answers // questionId (String) -> answerText
) {
    StudentExam existing = studentExamRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("StudentExam not found"));

    String currentUserId = SecurityUtils.getCurrentUserId();
    if (currentUserId == null || !currentUserId.equals(existing.getKeycloakUserId())) {
        throw new RuntimeException("Unauthorized");
    }

    if (existing.getStatus() != StudentExam.ExamStatus.IN_PROGRESS) {
        throw new RuntimeException("Exam is not in progress");
    }

    // Save all answers
    answers.forEach((questionIdStr, answerText) -> {
        if (answerText != null && !answerText.isBlank()) {
            Long questionId = Long.parseLong(questionIdStr);
            Answer answer = new Answer();
            answer.setStudentExam(existing);
            answer.setQuestion(questionRepository.getReferenceById(questionId));
            answer.setAnswerText(answerText);
            answerRepository.save(answer);
        }
    });

    // Mark submitted
    existing.setStatus(StudentExam.ExamStatus.SUBMITTED);
    existing.setSubmittedAt(LocalDateTime.now());
    studentExamRepository.save(existing);

    // Auto-grade (sets GRADED status internally)
    gradingService.gradeExam(id);

    StudentExam graded = studentExamRepository.findById(id).orElseThrow();
    return Map.of(
            "studentExamId", graded.getId(),
            "status", graded.getStatus(),
            "score", graded.getScore() != null ? graded.getScore() : 0.0
    );
}
```

- [ ] **Step 3 — Verify backend compiles**

```bash
cd backend && ./mvnw -q compile
echo "exit=$?"
```

Expected: `exit=0`

- [ ] **Step 4 — Update TakeExam.tsx `handleSubmit`**

Open `frontend/src/pages/TakeExam.tsx`.

Replace the entire `handleSubmit` function (lines ~128–157) with:

```tsx
const handleSubmit = async () => {
  if (!studentExamId) return;

  try {
    // Build answersMap: { questionId: answerText }
    const answersMap: Record<string, string> = {};
    answers.forEach((a) => {
      if (a.answerText) {
        answersMap[String(a.questionId)] = a.answerText;
      }
    });

    const res = await api.post(`/student-exams/${studentExamId}/submit`, answersMap);
    navigate(`/student/result/${res.data.studentExamId}`);
  } catch (error) {
    console.error('Error submitting exam:', error);
    alert('Sınav teslim edilirken hata oluştu!');
  }
};
```

- [ ] **Step 5 — Verify frontend builds**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 6 — Commit**

```bash
git add \
  backend/src/main/java/cse/quiz/system/controller/StudentExamController.java \
  frontend/src/pages/TakeExam.tsx
git commit -m "feat(backend): atomic exam submission endpoint

Replace three-step frontend waterfall (N×POST /answers + PUT status +
POST grade) with a single POST /student-exams/{id}/submit that saves all
answers, marks SUBMITTED, and runs auto-grading in one transaction.
A network failure at any point no longer leaves a partially-saved state."
```

---

## Task 2: Frontend Auth Loading State + Route Guards

**Commit message:** `fix(frontend): block routes until Keycloak init, add role-based guards`

**Problems:**
1. `AuthContext` renders children before `keycloak.init()` resolves → API calls fire without a token → 401 storm.
2. Any URL is accessible regardless of role (no `ProtectedRoute`).
3. `Navbar.tsx` attaches a global `document.addEventListener` that pollutes every button on the page and leaks on HMR.
4. `axios.ts` 401-retry uses global `axios` instance instead of `api` instance.
5. `AuthContext` logs raw JWT token to browser console (PII leak).

### Files

- **Modify:** `frontend/src/context/AuthContext.tsx`
- **Modify:** `frontend/src/App.tsx`
- **Create:** `frontend/src/components/ProtectedRoute.tsx`
- **Modify:** `frontend/src/components/Navbar.tsx`
- **Modify:** `frontend/src/api/axios.ts`

---

- [ ] **Step 1 — Add `loading` state to AuthContext**

Replace the entire contents of `frontend/src/context/AuthContext.tsx` with:

```tsx
import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import keycloak from '../keycloak';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: { username: string; email: string; roles: string[] } | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [token, setToken] = useState<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      })
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
        if (authenticated && keycloak.tokenParsed) {
          const p = keycloak.tokenParsed as Record<string, unknown>;
          setUser({
            username: (p.preferred_username as string) || '',
            email: (p.email as string) || '',
            roles: ((p.realm_access as Record<string, string[]>)?.roles) || [],
          });
          setToken(keycloak.token || null);
        }
      })
      .catch((err) => console.error('Keycloak init error:', err))
      .finally(() => setLoading(false));

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => keycloak.logout());
    };
  }, []);

  const login = () => keycloak.login();
  const logout = () => keycloak.logout({ redirectUri: window.location.origin });
  const hasRole = (role: string) => user?.roles.includes(role) ?? false;

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, token, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

- [ ] **Step 2 — Create ProtectedRoute component**

Create new file `frontend/src/components/ProtectedRoute.tsx`:

```tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  roles?: string[];
  children: ReactNode;
}

export default function ProtectedRoute({ roles, children }: Props) {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (roles && !roles.some(hasRole)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
```

- [ ] **Step 3 — Wrap routes in App.tsx with ProtectedRoute**

Open `frontend/src/App.tsx`.

Add the import at the top:
```tsx
import ProtectedRoute from './components/ProtectedRoute';
```

Replace the `<Routes>` block with:

```tsx
<Routes>
  <Route path="/" element={<Home />} />

  {/* Student routes */}
  <Route path="/student" element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
  <Route path="/student/my-results" element={<ProtectedRoute roles={['STUDENT']}><MyResults /></ProtectedRoute>} />
  <Route path="/student/notifications" element={<ProtectedRoute roles={['STUDENT']}><NotificationList /></ProtectedRoute>} />
  <Route path="/student/exam/:id" element={<ProtectedRoute roles={['STUDENT']}><TakeExam /></ProtectedRoute>} />
  <Route path="/student/result/:studentExamId" element={<ProtectedRoute roles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}><ExamResult /></ProtectedRoute>} />

  {/* Instructor routes */}
  <Route path="/instructor" element={<ProtectedRoute roles={['INSTRUCTOR']}><InstructorDashboard /></ProtectedRoute>} />
  <Route path="/instructor/create-exam" element={<ProtectedRoute roles={['INSTRUCTOR']}><CreateExam /></ProtectedRoute>} />
  <Route path="/instructor/exam/:id" element={<ProtectedRoute roles={['INSTRUCTOR']}><ExamDetail /></ProtectedRoute>} />
  <Route path="/instructor/exam/:id/preview" element={<ProtectedRoute roles={['INSTRUCTOR']}><ExamPreview /></ProtectedRoute>} />
  <Route path="/instructor/exam/:id/results" element={<ProtectedRoute roles={['INSTRUCTOR']}><ExamResults /></ProtectedRoute>} />
  <Route path="/instructor/exam/:id/statistics" element={<ProtectedRoute roles={['INSTRUCTOR']}><ExamStatistics /></ProtectedRoute>} />
  <Route path="/instructor/result/:studentExamId" element={<ProtectedRoute roles={['INSTRUCTOR']}><ExamResult /></ProtectedRoute>} />
  <Route path="/instructor/grade/:studentExamId" element={<ProtectedRoute roles={['INSTRUCTOR']}><ManualGrading /></ProtectedRoute>} />
  <Route path="/instructor/questions" element={<ProtectedRoute roles={['INSTRUCTOR']}><QuestionBank /></ProtectedRoute>} />
  <Route path="/instructor/bulk-import" element={<ProtectedRoute roles={['INSTRUCTOR']}><BulkImport /></ProtectedRoute>} />
  <Route path="/instructor/categories" element={<ProtectedRoute roles={['INSTRUCTOR']}><CategoryManagement /></ProtectedRoute>} />
  <Route path="/instructor/exam/:id/add-questions" element={<ProtectedRoute roles={['INSTRUCTOR']}><AddQuestionsToExam /></ProtectedRoute>} />

  {/* Admin routes */}
  <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
  <Route path="/admin/exam/:id" element={<ProtectedRoute roles={['ADMIN']}><AdminExamDetail /></ProtectedRoute>} />
</Routes>
```

- [ ] **Step 4 — Fix Navbar hover side effect**

Open `frontend/src/components/Navbar.tsx`.

Delete the two `document.addEventListener` blocks at the bottom of the file (lines ~81-94). They implement hover via global DOM mutation — replace with CSS in the component.

Change the `iconButtonStyle` function and button elements so hover is handled by React's `onMouseEnter`/`onMouseLeave`. The Navbar already renders only two buttons (Home, Logout) and NotificationBell. Add local hover state per button:

```tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [homeHovered, setHomeHovered] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);

  if (location.pathname === '/' || !isAuthenticated) return null;

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px',
      borderRadius: '999px', background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(14px)', border: '1px solid #e2e8f0',
      boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
    }}>
      <button
        onClick={() => navigate('/')}
        title="Ana Sayfa"
        onMouseEnter={() => setHomeHovered(true)}
        onMouseLeave={() => setHomeHovered(false)}
        style={iconButtonStyle('#f1f5f9', '#334155', homeHovered)}
      >
        <Home size={16} />
      </button>

      <NotificationBell />

      <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 2px' }} />

      <button
        onClick={logout}
        title="Çıkış Yap"
        onMouseEnter={() => setLogoutHovered(true)}
        onMouseLeave={() => setLogoutHovered(false)}
        style={iconButtonStyle('#fff1f2', '#dc2626', logoutHovered)}
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

const iconButtonStyle = (bg: string, color: string, hovered: boolean) => ({
  width: '34px', height: '34px', borderRadius: '999px',
  border: '1px solid #e2e8f0', background: bg, color,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'all 0.2s ease',
  transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
  boxShadow: hovered ? '0 8px 18px rgba(15,23,42,0.12)' : 'none',
});
```

- [ ] **Step 5 — Fix axios.ts 401 retry**

Open `frontend/src/api/axios.ts`. Replace `axios.request(error.config)` with `api.request(error.config)` so the retry goes through the same interceptors:

```ts
import axios from 'axios';
import keycloak from '../keycloak';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;
      try {
        await keycloak.updateToken(30);
        originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
        return api.request(originalRequest); // use api, not axios
      } catch {
        keycloak.login();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

- [ ] **Step 6 — Verify frontend builds**

```bash
cd frontend && npm run build 2>&1 | tail -15
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 7 — Commit**

```bash
git add \
  frontend/src/context/AuthContext.tsx \
  frontend/src/App.tsx \
  frontend/src/components/ProtectedRoute.tsx \
  frontend/src/components/Navbar.tsx \
  frontend/src/api/axios.ts
git commit -m "fix(frontend): block routes until Keycloak init, add role-based guards

- AuthContext: expose 'loading' state; gate children until keycloak.init()
  resolves to prevent API calls before token is available; remove
  console.log of token/user data (PII leak)
- ProtectedRoute: new component that redirects to / if unauthenticated
  or wrong role
- App: wrap all /student, /instructor, /admin routes with ProtectedRoute
- Navbar: replace global document.addEventListener hover hack with
  React onMouseEnter/onMouseLeave per button
- axios: use api.request() instead of axios.request() in 401 retry to
  preserve baseURL and interceptors; add _retried flag to break loop"
```

---

## Task 3: DTO Layer + Exception Handler + @Valid

**Commit message:** `refactor(backend): add DTO layer, global exception handler, and request validation`

**Problems:**
1. Controllers return JPA entities directly → correctAnswer still leaks via ExamQuestion endpoint (even though Question has @JsonIgnore, verify it propagates through ExamQuestion serialization).
2. All `throw new RuntimeException(...)` return HTTP 500 with no body. Clients can't distinguish 404 from 403 from 500.
3. No `@Valid` on request bodies → malformed requests silently corrupt data.

### Files

- **Create:** `backend/src/main/java/cse/quiz/system/dto/QuestionStudentDto.java`
- **Create:** `backend/src/main/java/cse/quiz/system/dto/ExamQuestionStudentDto.java`
- **Create:** `backend/src/main/java/cse/quiz/system/exception/NotFoundException.java`
- **Create:** `backend/src/main/java/cse/quiz/system/exception/UnauthorizedException.java`
- **Create:** `backend/src/main/java/cse/quiz/system/exception/GlobalExceptionHandler.java`
- **Modify:** `backend/src/main/java/cse/quiz/system/controller/ExamQuestionController.java`
- **Modify:** `backend/src/main/java/cse/quiz/system/controller/QuestionPoolController.java`
- **Modify:** `backend/src/main/java/cse/quiz/system/controller/ResultController.java` (replace RuntimeException with typed exceptions)

---

- [ ] **Step 1 — Create QuestionStudentDto**

Create `backend/src/main/java/cse/quiz/system/dto/QuestionStudentDto.java`:

```java
package cse.quiz.system.dto;

import cse.quiz.system.entity.Question;

public record QuestionStudentDto(
        Long id,
        Question.QuestionType type,
        String questionText,
        String options,
        Integer points
) {
    public static QuestionStudentDto from(Question q) {
        return new QuestionStudentDto(
                q.getId(), q.getType(), q.getQuestionText(),
                q.getOptions(), q.getPoints()
        );
    }
}
```

- [ ] **Step 2 — Create ExamQuestionStudentDto**

Create `backend/src/main/java/cse/quiz/system/dto/ExamQuestionStudentDto.java`:

```java
package cse.quiz.system.dto;

import cse.quiz.system.entity.ExamQuestion;

public record ExamQuestionStudentDto(
        Long id,
        QuestionStudentDto question,
        Integer orderIndex
) {
    public static ExamQuestionStudentDto from(ExamQuestion eq) {
        return new ExamQuestionStudentDto(
                eq.getId(),
                QuestionStudentDto.from(eq.getQuestion()),
                eq.getOrderIndex()
        );
    }
}
```

- [ ] **Step 3 — Create domain exceptions**

Create `backend/src/main/java/cse/quiz/system/exception/NotFoundException.java`:

```java
package cse.quiz.system.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) { super(message); }
}
```

Create `backend/src/main/java/cse/quiz/system/exception/UnauthorizedException.java`:

```java
package cse.quiz.system.exception;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) { super(message); }
}
```

- [ ] **Step 4 — Create GlobalExceptionHandler**

Create `backend/src/main/java/cse/quiz/system/exception/GlobalExceptionHandler.java`:

```java
package cse.quiz.system.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, String>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst().orElse("Validation failed");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", message));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", ex.getMessage()));
    }
}
```

- [ ] **Step 5 — Update ExamQuestionController to return student DTOs**

Open `backend/src/main/java/cse/quiz/system/controller/ExamQuestionController.java`.

Add import:
```java
import cse.quiz.system.dto.ExamQuestionStudentDto;
import java.util.stream.Collectors;
```

Change `getExamQuestions` return type:

```java
@GetMapping("/exam/{examId}")
public List<ExamQuestionStudentDto> getExamQuestions(@PathVariable Long examId) {
    return examQuestionRepository.findByExamId(examId).stream()
            .map(ExamQuestionStudentDto::from)
            .collect(Collectors.toList());
}
```

- [ ] **Step 6 — Update QuestionPoolController to return student DTOs**

Open `backend/src/main/java/cse/quiz/system/controller/QuestionPoolController.java`.

Add import:
```java
import cse.quiz.system.dto.QuestionStudentDto;
import java.util.stream.Collectors;
```

Change `getAssignedQuestions` and `assignRandomQuestions` return types to `List<QuestionStudentDto>` and map:

```java
@PostMapping("/student-exam/{studentExamId}/assign")
public List<QuestionStudentDto> assignRandomQuestions(@PathVariable Long studentExamId) {
    return questionPoolService.assignRandomQuestions(studentExamId).stream()
            .map(QuestionStudentDto::from)
            .collect(Collectors.toList());
}

@GetMapping("/student-exam/{studentExamId}")
public List<QuestionStudentDto> getAssignedQuestions(@PathVariable Long studentExamId) {
    return questionPoolService.getAssignedQuestions(studentExamId).stream()
            .map(QuestionStudentDto::from)
            .collect(Collectors.toList());
}
```

- [ ] **Step 7 — Replace RuntimeException with typed exceptions in ResultController**

Open `backend/src/main/java/cse/quiz/system/controller/ResultController.java`.

Add imports:
```java
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.exception.UnauthorizedException;
```

Replace all:
- `throw new RuntimeException("StudentExam not found")` → `throw new NotFoundException("StudentExam not found")`
- `throw new RuntimeException("Answer not found")` → `throw new NotFoundException("Answer not found")`
- `throw new RuntimeException("Unauthorized")` → `throw new UnauthorizedException("Unauthorized")`

Do the same replace pattern in `StudentExamController`, `AnswerController`, and `ExamController`.

- [ ] **Step 8 — Verify backend compiles**

```bash
cd backend && ./mvnw -q compile
echo "exit=$?"
```

Expected: `exit=0`

- [ ] **Step 9 — Verify frontend still builds (ExamQuestionStudentDto shape change)**

The frontend `TakeExam.tsx` accesses `eq.question.id`, `eq.question.type`, etc. The new `ExamQuestionStudentDto` keeps the same field names, so no frontend change is needed. Verify:

```bash
cd frontend && npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 10 — Commit**

```bash
git add \
  backend/src/main/java/cse/quiz/system/dto/ \
  backend/src/main/java/cse/quiz/system/exception/ \
  backend/src/main/java/cse/quiz/system/controller/ExamQuestionController.java \
  backend/src/main/java/cse/quiz/system/controller/QuestionPoolController.java \
  backend/src/main/java/cse/quiz/system/controller/ResultController.java \
  backend/src/main/java/cse/quiz/system/controller/StudentExamController.java \
  backend/src/main/java/cse/quiz/system/controller/AnswerController.java \
  backend/src/main/java/cse/quiz/system/controller/ExamController.java
git commit -m "refactor(backend): DTO layer, typed exceptions, global error handler

- QuestionStudentDto / ExamQuestionStudentDto: student-facing question
  responses no longer include correctAnswer even via nested serialization
- GlobalExceptionHandler: maps NotFoundException→404, Unauthorized→403,
  MethodArgumentNotValid→400, RuntimeException→500 with JSON body
- Replace RuntimeException('X not found') with NotFoundException in
  Result, StudentExam, Answer, Exam controllers for proper 4xx responses"
```

---

## Task 4: User Entity Consolidation

**Commit message:** `refactor(backend): remove dead DataInitializer test data`

**Context:** The codebase has a half-finished Keycloak migration. JPA `User` entity (with DB table) still exists alongside `keycloakUserId` string fields on `StudentExam`, `Exam`, `Question`. `DataInitializer` creates fake `User` rows on every startup that nothing uses. Removing the full `User` entity is a larger undertaking (schema migration, cascade analysis). This commit removes only the dead startup side-effect.

**Scope:** Do NOT delete `User.java` or alter the DB schema in this commit — that would require a migration script. Just remove the startup noise.

### Files

- **Modify:** `backend/src/main/java/cse/quiz/system/config/DataInitializer.java`

---

- [ ] **Step 1 — Remove test-data creation from DataInitializer**

Replace the entire file `backend/src/main/java/cse/quiz/system/config/DataInitializer.java` with a no-op:

```java
package cse.quiz.system.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Override
    public void run(String... args) {
        // Identity is managed by Keycloak; no local seed data needed.
    }
}
```

- [ ] **Step 2 — Remove unused UserRepository import from DataInitializer pom/class chain**

Since `UserRepository` is now unused in `DataInitializer`, delete the import and the `@RequiredArgsConstructor` + field. The class above already has neither — you're done.

- [ ] **Step 3 — Verify compile**

```bash
cd backend && ./mvnw -q compile
echo "exit=$?"
```

Expected: `exit=0`

- [ ] **Step 4 — Commit**

```bash
git add backend/src/main/java/cse/quiz/system/config/DataInitializer.java
git commit -m "refactor(backend): remove dead DataInitializer test seed data

DataInitializer created User rows (student@test.com, instructor@test.com)
on every startup, but identity is now Keycloak-managed. No code reads
these rows. Removing eliminates startup side-effects and DB confusion.
Full User entity consolidation (removing the legacy table) is a
separate migration requiring schema changes."
```

---

## Task 5: Performance — SQL Aggregation + Async Notification

**Commit message:** `perf(backend): replace in-memory aggregations with SQL, make notification async`

**Problems:**
1. `AdminController.getSystemStats` calls `studentExamRepository.findAll().stream().filter(...)` — loads every row to count two statuses.
2. `ResultController.getExamStatistics` loads all student answers into memory and groups in Java — catastrophic at scale.
3. `KeycloakService.getAllStudentIds` fires one HTTP call per user to check roles (`listEffective()`), O(N) Keycloak calls.
4. `NotificationService.notifyNewExamPublished` runs synchronously on the exam-publish request thread — blocks the PUT response for N×Keycloak calls.

### Files

- **Modify:** `backend/src/main/java/cse/quiz/system/repository/StudentExamRepository.java`
- **Modify:** `backend/src/main/java/cse/quiz/system/controller/AdminController.java`
- **Modify:** `backend/src/main/java/cse/quiz/system/service/KeycloakService.java`
- **Modify:** `backend/src/main/java/cse/quiz/system/service/NotificationService.java`
- **Modify:** `backend/src/main/java/cse/quiz/system/SystemApplication.java`

---

- [ ] **Step 1 — Add a COUNT query to StudentExamRepository**

Open `backend/src/main/java/cse/quiz/system/repository/StudentExamRepository.java`.

Add:

```java
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import cse.quiz.system.entity.StudentExam.ExamStatus;

// Count rows by any set of statuses
@Query("SELECT COUNT(se) FROM StudentExam se WHERE se.status IN :statuses")
long countByStatusIn(@Param("statuses") java.util.List<ExamStatus> statuses);
```

- [ ] **Step 2 — Update AdminController.getSystemStats**

Open `backend/src/main/java/cse/quiz/system/controller/AdminController.java`.

Replace `getSystemStats`:

```java
@GetMapping("/stats")
public Map<String, Object> getSystemStats() {
    Map<String, Object> stats = new HashMap<>();
    stats.put("totalExams", examRepository.count());
    stats.put("totalQuestions", questionRepository.count());
    stats.put("totalStudentExams", studentExamRepository.count());
    stats.put("completedExams", studentExamRepository.countByStatusIn(
            List.of(StudentExam.ExamStatus.GRADED, StudentExam.ExamStatus.SUBMITTED)));
    return stats;
}
```

Add import at top if missing:
```java
import java.util.List;
```

- [ ] **Step 3 — Fix KeycloakService to use role-members endpoint**

Open `backend/src/main/java/cse/quiz/system/service/KeycloakService.java`.

Replace the entire `getAllStudentIds` method:

```java
public List<String> getAllStudentIds() {
    try {
        return keycloak.realm(realm)
                .roles()
                .get("STUDENT")
                .getUserMembers()
                .stream()
                .map(user -> user.getId())
                .collect(Collectors.toList());
    } catch (Exception e) {
        System.err.println("Error fetching students from Keycloak: " + e.getMessage());
        return List.of();
    }
}
```

Delete the private `hasRole(UserRepresentation, String)` method — it is no longer used.

Remove unused import `import org.keycloak.representations.idm.UserRepresentation;` if your IDE flags it.

- [ ] **Step 4 — Enable @Async on the Spring app**

Open `backend/src/main/java/cse/quiz/system/SystemApplication.java`.

Add `@EnableAsync`:

```java
package cse.quiz.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(SystemApplication.class, args);
    }
}
```

- [ ] **Step 5 — Make notifyNewExamPublished async**

Open `backend/src/main/java/cse/quiz/system/service/NotificationService.java`.

Add import:
```java
import org.springframework.scheduling.annotation.Async;
```

Add `@Async` to `notifyNewExamPublished`:

```java
@Async
public void notifyNewExamPublished(Long examId) {
    // ... existing body unchanged
}
```

- [ ] **Step 6 — Verify compile**

```bash
cd backend && ./mvnw -q compile
echo "exit=$?"
```

Expected: `exit=0`

- [ ] **Step 7 — Commit**

```bash
git add \
  backend/src/main/java/cse/quiz/system/repository/StudentExamRepository.java \
  backend/src/main/java/cse/quiz/system/controller/AdminController.java \
  backend/src/main/java/cse/quiz/system/service/KeycloakService.java \
  backend/src/main/java/cse/quiz/system/service/NotificationService.java \
  backend/src/main/java/cse/quiz/system/SystemApplication.java
git commit -m "perf(backend): SQL aggregation, single Keycloak role-members call, async notify

- StudentExamRepository: add countByStatusIn JPQL query to replace
  findAll().stream().filter() in AdminController
- KeycloakService: replace O(N) per-user listEffective() with a single
  role.getUserMembers() call to fetch all STUDENT role members
- NotificationService: mark notifyNewExamPublished @Async so exam
  publish requests are not blocked by N notification inserts
- SystemApplication: add @EnableAsync to activate async processing"
```

---

## Task 6: Frontend Component Decomposition

**Commit message:** `refactor(frontend): extract custom hooks and sub-components from large pages`

**Problem:** Pages like `AdminDashboard.tsx` (738 lines), `ExamStatistics.tsx` (626 lines), `CreateExam.tsx` (621 lines) mix fetch logic, state, business logic, inline styles, and JSX. This commit establishes a pattern by decomposing `AdminDashboard` and creates reusable hooks, leaving the remaining pages as a follow-up.

**Pattern to establish:**
- Fetch + state → `hooks/useXxx.ts`
- Large JSX chunks → small named components in same file or `components/admin/`
- Shared inline `styles` object → stay inline for now (CSS/Tailwind migration is a separate project)

### Files

- **Create:** `frontend/src/hooks/useAdminDashboard.ts`
- **Modify:** `frontend/src/pages/AdminDashboard.tsx`

---

- [ ] **Step 1 — Extract useAdminDashboard hook**

Create `frontend/src/hooks/useAdminDashboard.ts`:

```ts
import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import type { Exam, Question } from '../types';

interface Stats {
  totalExams: number;
  totalQuestions: number;
  totalStudentExams: number;
  completedExams: number;
}

interface StudentExam {
  id: number;
  exam: Exam;
  keycloakUserId: string;
  status: string;
  score: number;
  startedAt: string;
  submittedAt: string;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/exams'),
      api.get('/admin/questions'),
      api.get('/admin/student-exams'),
    ])
      .then(([statsRes, examsRes, questionsRes, submissionsRes]) => {
        setStats(statsRes.data);
        setExams(examsRes.data);
        setQuestions(questionsRes.data);
        setSubmissions(submissionsRes.data);
      })
      .catch(() => setError('Veriler yüklenemedi'))
      .finally(() => setLoading(false));
  }, []);

  const deleteExam = async (id: number) => {
    await api.delete(`/admin/exams/${id}`);
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const deleteQuestion = async (id: number) => {
    await api.delete(`/admin/questions/${id}`);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const filteredExams = useMemo(
    () => exams.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [exams, searchQuery]
  );

  const filteredQuestions = useMemo(
    () =>
      questions.filter((q) =>
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [questions, searchQuery]
  );

  return {
    stats, exams: filteredExams, questions: filteredQuestions,
    submissions, loading, error, searchQuery, setSearchQuery,
    deleteExam, deleteQuestion,
  };
}
```

- [ ] **Step 2 — Update AdminDashboard.tsx to use the hook**

Open `frontend/src/pages/AdminDashboard.tsx`.

Replace the top of the file (imports + interface + state declarations + useEffect + handler functions — everything before the `return`) with:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, BookOpen, CheckCircle2, Clock3, Eye, FileText,
  Layers, Search, Shield, Sparkles, Trash2, TrendingUp, Users,
} from 'lucide-react';
import type { Exam, Question } from '../types';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

type ActiveTab = 'exams' | 'questions' | 'submissions';
```

Then in the component function body replace the state + effect block with:

```tsx
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('exams');
  const {
    stats, exams, questions, submissions,
    loading, error, searchQuery, setSearchQuery,
    deleteExam, deleteQuestion,
  } = useAdminDashboard();

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
```

Remove the old `const [stats, setStats]...`, `useEffect(...)`, `loadData()`, `handleDeleteExam()`, `handleDeleteQuestion()`, `filteredExams`, `filteredQuestions` declarations — these are now provided by the hook.

Update all references:
- `handleDeleteExam(id)` → `deleteExam(id)`
- `handleDeleteQuestion(id)` → `deleteQuestion(id)`
- `setSearchTerm` → `setSearchQuery`
- `searchTerm` → `searchQuery`

- [ ] **Step 3 — Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: Build succeeds. Fix any remaining variable name mismatches from the rename (the compiler will point to them).

- [ ] **Step 4 — Commit**

```bash
git add \
  frontend/src/hooks/useAdminDashboard.ts \
  frontend/src/pages/AdminDashboard.tsx
git commit -m "refactor(frontend): extract useAdminDashboard hook from AdminDashboard page

Move all fetch, state, filtering, and delete logic out of AdminDashboard
into a dedicated hook. Establishes the pattern for the remaining large
pages (ExamStatistics, CreateExam, ManualGrading, CategoryManagement).
No behavior change."
```

---

## Post-Completion Notes

### Items deliberately deferred
- **Full DTO layer** (Task 3): only student-facing question endpoints use DTOs. Remaining controllers (`ExamController`, `StudentExamController`) still return entities. Full DTO rollout is paired with adding `@Valid` to request bodies — do together in a follow-up.
- **Exam time enforcement on backend**: `StudentExamController.startExam` should verify `now` is within `Exam.startTime..endTime`. Not in this plan to keep scope manageable.
- **User entity full removal**: deleting the `users` table requires a Flyway migration script. Schema migration work belongs in a dedicated DB-migration commit.
- **Remaining large pages**: `ExamStatistics`, `CreateExam`, `ManualGrading`, `CategoryManagement` should each get a `useXxx` hook following the pattern from Task 6.
- **CORS cleanup**: three CORS configs (`SecurityConfig`, `WebConfig`, `application.properties`) are redundant — remove `WebConfig` and the `spring.web.cors.*` properties, keep only `SecurityConfig.corsConfigurationSource()`.

### Verify before shipping
- MCQ scoring convention: confirm QuestionBank UI stores `correctAnswer` as `"A"` / `"B"` (letter only) for `MULTIPLE_CHOICE` questions, not full option text.
- Set real env vars before deploying (`DB_PASSWORD`, `KEYCLOAK_ADMIN_PASSWORD`, etc.).
- `spring.jpa.hibernate.ddl-auto=update` should become `validate` (and use Flyway) before production.

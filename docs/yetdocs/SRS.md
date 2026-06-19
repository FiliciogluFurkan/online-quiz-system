# Software Requirements Specification (SRS)
# Online Quiz and Exam System

## 1. Introduction

### 1.1 Purpose

This document defines the software requirements for the Online Quiz and Exam System. It describes the intended users, system features, functional requirements, non-functional requirements, and use cases for the project.

The SRS is intended for project team members, instructors, evaluators, and future developers who need to understand what the system is expected to do.

### 1.2 Scope

The Online Quiz and Exam System is a web-based platform for creating, managing, delivering, and evaluating online quizzes and exams.

The target system supports three main user roles:

- Student
- Instructor
- Admin

The current prototype implements Student, Instructor, and Admin workflows. The Admin role has a dedicated panel (system statistics, user-role distribution, exam/question/submission listing and deletion, and an audit log). Some advanced admin features — in-app user activation/deactivation and role assignment — are still handled via the Keycloak admin console.

### 1.3 Definitions, Acronyms, and Abbreviations

- SRS: Software Requirements Specification.
- SDD: Software Design Document.
- UI: User Interface.
- API: Application Programming Interface.
- JWT: JSON Web Token.
- SSO: Single Sign-On.
- Keycloak: Identity and access management system used for authentication and role management.
- Objective Question: A question type that can be graded automatically, such as multiple choice or true/false.
- Subjective Question: A question type that may require manual review, such as short answer.

### 1.4 References

- Project problem statement: Online Quiz and Exam System.
- Project overview: `docs/PROJECT_OVERVIEW.md`.
- Existing source code under `backend/` and `frontend/`.
- Keycloak setup guide: `KEYCLOAK_SETUP.md`.

### 1.5 Overview

The rest of this document describes the overall system, user classes, functional requirements, non-functional requirements, external interfaces, use cases, and requirement traceability notes.

## 2. Overall Description

### 2.1 Product Perspective

The system is a client-server web application.

- The frontend is a React/Vite application.
- The backend is a Spring Boot REST API.
- PostgreSQL is used for persistent data storage.
- Keycloak is used for authentication and role-based access.

The frontend communicates with the backend through HTTP APIs. Authenticated requests include a bearer token issued by Keycloak.

### 2.2 Product Functions

The target system provides the following high-level functions:

- Authenticate users and identify their roles.
- Display role-based dashboards.
- Allow instructors to create and manage questions.
- Allow instructors to create and publish exams.
- Allow instructors to add questions to exams.
- Allow instructors to organize students into classes and assign exams to them.
- Allow students to join classes via a join code and see exams assigned to them.
- Allow students to view available exams.
- Allow students to take and submit exams.
- Store student answers.
- Automatically grade objective questions.
- Allow instructors to attach images to questions for visual/diagram-based items.
- Support partial-credit manual grading with feedback for open-ended answers.
- Notify users of key events (new exam, graded result, etc.) and show an unread count.
- Let users view their account/profile settings.
- Show exam results to students and instructors.
- Allow admins to manage users, roles, categories, and system-level reports.

### 2.3 User Classes and Characteristics

#### Student

Students use the system to view available exams, take exams, submit answers, and review their results. They can also join an instructor's class with a join code so that class-restricted exams become available to them. They need a simple and reliable interface, especially during active exams.

#### Instructor

Instructors use the system to manage question banks, create exams, publish exams, organize students into classes, assign exams to classes, and review student results. They need efficient workflows for assessment preparation and evaluation.

#### Admin

Admins manage system-wide content and monitor activity. The prototype includes an admin panel with system statistics, user-role distribution, exam/question/submission management, and an audit log. In-app user activation and role assignment remain future work (currently performed via Keycloak).

#### System

The system performs internal responsibilities such as authentication token validation, answer persistence, exam attempt status tracking, and automatic grading.

### 2.4 Operating Environment

The expected local development environment includes:

- Modern web browser.
- Node.js and npm for the frontend.
- Java 25 for the backend.
- Docker for PostgreSQL and Keycloak.
- PostgreSQL 16.
- Keycloak 23.

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Keycloak: `http://localhost:8180`

### 2.5 Design and Implementation Constraints

- The backend must use Java and Spring Boot.
- The frontend must use React and TypeScript.
- Authentication must be integrated with Keycloak.
- The system must separate student, instructor, and admin responsibilities.
- The system should maintain documentation as part of the project deliverables.
- The prototype is developed within a limited academic project timeline.

### 2.6 Assumptions and Dependencies

- Keycloak is available and configured with the required realm, clients, and roles.
- PostgreSQL is available through Docker Compose during local development.
- Students and instructors have valid user accounts.
- Instructors are responsible for creating valid questions and exam configurations.
- Admin features may require additional implementation beyond the current prototype.

## 3. System Features and Functional Requirements

Requirement status labels:

- Implemented: Present in the current prototype.
- Partial: Partly present, but missing important behavior.
- Planned: Target requirement that is not fully implemented yet.

### 3.1 Authentication and Role Management

- FR-001: The system shall authenticate users through Keycloak. Status: Implemented.
- FR-002: The system shall store and read user roles from authentication tokens. Status: Implemented.
- FR-003: The system shall display role-based navigation options. Status: Implemented. (Role-aware sidebar/shell per Student/Instructor/Admin.)
- FR-004: The system shall support Student, Instructor, and Admin roles. Status: Implemented. (All three roles have dedicated panels.)
- FR-005: The system shall allow admins to assign roles to users. Status: Planned. (Role assignment is currently performed in the Keycloak admin console, not in the app UI.)
- FR-056: The system shall provide an account settings page where any authenticated user can view their profile/identity information and open the Keycloak account console to manage their account (e.g., change password). Status: Implemented (basic).

### 3.2 Question Bank Management

- FR-006: The system shall allow instructors to create, edit and delete questions (with ownership checks). Status: Implemented.
- FR-007: The system shall support multiple-choice questions. Status: Implemented.
- FR-008: The system shall support true/false questions. Status: Implemented.
- FR-009: The system shall support short-answer questions. Status: Implemented. (Create, take, and manual grading supported.)
- FR-010: The system shall allow questions to be associated with categories. Status: Implemented.
- FR-011: The system shall allow instructors to view their own questions. Status: Implemented.
- FR-055: The system shall allow instructors to attach an image to a question (uploaded via the `/api/uploads/image` endpoint, restricted to instructor/admin), and shall display that image to students during exam taking and in exam preview and result screens. Status: Implemented.

### 3.3 Exam Management

- FR-012: The system shall allow instructors to create exams. Status: Implemented.
- FR-013: The system shall allow instructors to define exam title, description, duration, start time, and end time. Status: Implemented.
- FR-014: The system shall allow instructors to add questions to exams. Status: Implemented.
- FR-015: The system shall allow instructors to publish exams (and unpublish; publishing requires at least one question). Status: Implemented.
- FR-016: The system shall support a question pool that delivers a random subset of questions per student. Status: Implemented.
- FR-017: The system shall prevent unauthorized users from modifying exams. Status: Implemented. (Role guards + instructor ownership checks; active-exam critical fields locked.)

### 3.4 Exam Taking

- FR-018: The system shall allow students to view the published exams available to them, i.e. exams with PUBLIC visibility or exams assigned to a class in which the student is enrolled. Status: Implemented. (Server-side filtering on `/exams/published`.)
- FR-019: The system shall allow students to start an exam attempt only within the exam's time window and only if the student has access to the exam (PUBLIC visibility or enrolled in an assigned class). Status: Implemented. (Server-side access guard on attempt start.)
- FR-020: The system shall allow students to continue an in-progress attempt. Status: Implemented.
- FR-021: The system shall prevent students from retaking an already submitted or graded exam. Status: Implemented.
- FR-022: The system shall allow students to submit answers. Status: Implemented.
- FR-023: The system shall auto-save in-progress answers. Status: Implemented. (Client-side localStorage; restored on reload. Server-side persistence is future work.)

### 3.5 Grading and Results

- FR-024: The system shall automatically grade multiple-choice answers. Status: Implemented.
- FR-025: The system shall automatically grade true/false answers. Status: Implemented.
- FR-026: The system shall support manual grading for short-answer questions, including partial credit and written feedback. A short answer that exactly matches (case- and whitespace-insensitive) the correct answer is auto-graded; otherwise it is routed to the instructor for manual review. On manual grading the per-answer points (full / partial / zero) and the student's total score are recomputed automatically. Status: Implemented.
- FR-027: The system shall calculate and store exam scores. Status: Implemented.
- FR-028: The system shall allow students to view their exam result (with per-question detail and PDF export). Status: Implemented.
- FR-029: The system shall allow instructors to view results for an exam. Status: Implemented.

### 3.6 Reporting and Analytics

- FR-030: The system shall show result summaries for student attempts. Status: Implemented.
- FR-031: The system shall provide question-level statistics (difficulty, discrimination, distractor analysis). Status: Implemented.
- FR-032: The system shall provide instructor-facing analytics (per-exam stats, class aggregate, category breakdown). Status: Implemented.
- FR-033: The system shall provide admin-facing system reports. Status: Partial. (System totals + audit log exist; a full reporting suite is future work.)

### 3.7 Administration

- FR-034: The system shall allow admins to view system-wide users, exams, questions and submissions. Status: Partial. (Role counts + participation/submission lists exist; a full user-management list is future work.)
- FR-035: The system shall allow admins to activate or deactivate users. Status: Planned.
- FR-036: The system shall allow admins to manage user roles. Status: Planned. (Currently via Keycloak admin console.)
- FR-037: The system shall allow admins to manage global categories. Status: Implemented. (Admins can delete; instructors create/edit.)
- FR-038: The system shall allow admins to monitor system activity. Status: Implemented. (Key actions are recorded in an audit log; admins can view it.)

### 3.8 Academic Integrity and Reliability

- FR-039: The system shall support randomized question delivery to reduce cheating. Status: Implemented. (Per-student pool selection.)
- FR-040: The system shall support monitoring or proctoring mechanisms. Status: Planned.
- FR-041: The system shall preserve exam progress during temporary interruptions. Status: Implemented. (In-progress attempt resume + client-side auto-save.)
- FR-042: The system shall prevent data loss during answer submission. Status: Implemented. (Atomic submission endpoint; time-expiry auto-submit.)

### 3.9 Notifications

- FR-043: The system shall notify users of relevant events. Supported notification types include: a new exam being published/assigned, an exam being graded, an upcoming exam, and system announcements. Status: Implemented.
- FR-044: The system shall show an unread notification count. Status: Implemented.
- FR-045: The system shall allow users to mark notifications as read (individually and all at once). Status: Implemented.

### 3.10 Bulk Operations and Export

- FR-046: The system shall allow instructors to bulk-import questions via CSV. Status: Implemented.
- FR-047: The system shall allow result pages to be exported as PDF. Status: Implemented. (Browser print-to-PDF with print-friendly styles.)

### 3.11 Classes, Enrollment, and Exam Assignment

This feature lets instructors group students into classes and control which students can access an exam. It complements (does not replace) question categories: a category groups *questions*, while a class groups *students*.

- FR-048: The system shall allow instructors to create, edit, and delete classes that they own. Status: Implemented. (A class with assigned exams cannot be deleted until its assignments are removed.)
- FR-049: The system shall generate a unique join code for each class. Status: Implemented. (6-character code using an unambiguous alphabet.)
- FR-050: The system shall allow students to enroll in a class by entering its join code, and shall prevent duplicate enrollment in the same class. Status: Implemented.
- FR-051: The system shall allow instructors to view the students enrolled in a class and to remove a student from a class. Status: Implemented.
- FR-052: The system shall let each exam have a visibility setting of either PUBLIC (all students) or CLASSES (only assigned classes), and shall allow an exam to be assigned to one or more classes. Status: Implemented. (Existing exams default to PUBLIC for backward compatibility.)
- FR-053: The system shall enforce class-based exam access on the server for both listing available exams and starting an attempt, so that students cannot access exams of classes they are not enrolled in. Status: Implemented.
- FR-054: The system shall target the "new exam published" notification to enrolled students of the assigned classes when an exam's visibility is CLASSES, and to all students when it is PUBLIC. Status: Implemented.

## 4. External Interface Requirements

### 4.1 User Interfaces

The system shall provide browser-based interfaces for:

- Home page and login entry.
- Student dashboard.
- Instructor dashboard.
- Question bank (with per-question image upload).
- All exams list (instructor).
- Exam creation and editing.
- Exam detail, question assignment, and exam visibility/class assignment.
- Account settings (profile + Keycloak account console link).
- Class management (instructor): class list, class detail with join code, members, and assigned exams.
- Class enrollment (student): join a class by code and list enrolled classes.
- Exam-taking screen.
- Result pages (with PDF export).
- Manual grading and exam statistics.
- Notifications.
- Admin dashboard.

### 4.2 Software Interfaces

The system uses:

- Keycloak for authentication.
- PostgreSQL for data storage.
- REST APIs between frontend and backend.
- Docker Compose for local infrastructure.

### 4.3 Communication Interfaces

The frontend communicates with the backend over HTTP. Authenticated API requests include an authorization header with a bearer token.

Future real-time features may use WebSocket communication.

## 5. Non-Functional Requirements

### 5.1 Security

- NFR-001: The system shall authenticate users before allowing protected operations.
- NFR-002: The system shall enforce role-based access control for student, instructor, and admin functions.
- NFR-003: The system shall validate JWT tokens issued by the configured Keycloak realm.
- NFR-004: The system shall prevent students from accessing other students' exam attempts or results.

### 5.2 Reliability

- NFR-005: The system should preserve submitted answers reliably.
- NFR-006: The system should avoid duplicate exam attempts after submission.
- NFR-007: The system should recover gracefully from temporary token expiration.
- NFR-008: The system should support future auto-save to reduce exam data loss.

### 5.3 Usability

- NFR-009: The system shall provide clear role-based navigation.
- NFR-010: The exam-taking interface shall be understandable and easy to use.
- NFR-011: Error messages should be understandable to students and instructors.

### 5.4 Performance

- NFR-012: The system should load dashboards and exam pages within an acceptable time for typical class-sized datasets.
- NFR-013: The system should grade objective questions quickly after submission.

### 5.5 Maintainability

- NFR-014: Backend business logic should be kept in services where appropriate.
- NFR-015: Frontend API communication should remain centralized through API helpers.
- NFR-016: Documentation should be updated when setup, authentication, routes, or core workflows change.

### 5.6 Accessibility

- NFR-017: The system should be usable across common desktop browsers.
- NFR-018: The system should use readable text, clear labels, and predictable navigation.
- NFR-019: The system should aim for keyboard-friendly navigation in exam and form screens.

## 6. Use Cases

### UC-001 - Login to the System

Actor: Student, Instructor, Admin

Goal: Authenticate through Keycloak and access the system.

Main flow:

1. The user opens the application.
2. The user selects login.
3. The system redirects the user to Keycloak.
4. The user enters valid credentials.
5. Keycloak returns an authentication token.
6. The system reads the user's roles and displays available navigation options.

### UC-002 - Logout from the System

Actor: Student, Instructor, Admin

Goal: End the authenticated session.

Main flow:

1. The user selects logout.
2. The system calls Keycloak logout.
3. The user is redirected to the home page.

### UC-003 - View Role-Based Dashboard

Actor: Student, Instructor, Admin

Goal: Access the correct dashboard according to user role.

Main flow:

1. The authenticated user opens the application.
2. The system checks the user's roles.
3. The system displays available dashboard links.
4. The user opens the relevant dashboard.

### UC-004 - Manage Question Bank

Actor: Instructor

Goal: Create and view reusable questions.

Main flow:

1. The instructor opens the question bank.
2. The instructor creates a question.
3. The system stores the question with type, text, answer data, points, and creator information.
4. The system displays the question in the question bank.

### UC-005 - Create Exam

Actor: Instructor

Goal: Define a new exam.

Main flow:

1. The instructor opens the create exam page.
2. The instructor enters exam details.
3. The instructor saves the exam.
4. The system stores the exam and associates it with the instructor.

### UC-006 - Add Questions to Exam

Actor: Instructor

Goal: Attach existing questions to an exam.

Main flow:

1. The instructor opens an exam detail page.
2. The instructor selects questions from the question bank.
3. The system creates exam-question links.
4. The selected questions become part of the exam.

### UC-007 - Publish Exam

Actor: Instructor

Goal: Make an exam visible to students.

Main flow:

1. The instructor opens an exam.
2. The instructor changes the publication status.
3. The system saves the exam as published.
4. Students can see the exam in their available exams list.

### UC-008 - View Available Exams

Actor: Student

Goal: See exams that are available to take.

Main flow:

1. The student opens the student dashboard.
2. The system loads published exams.
3. The system displays available exams.

### UC-009 - Take Exam

Actor: Student

Goal: Start or continue an exam attempt.

Main flow:

1. The student selects an exam.
2. The system checks whether the student already has an attempt.
3. If an in-progress attempt exists, the system opens it.
4. If no attempt exists, the system creates a new attempt.
5. The student answers exam questions.

### UC-010 - Submit Exam

Actor: Student

Goal: Complete an exam attempt.

Main flow:

1. The student finishes answering questions.
2. The student submits the exam.
3. The system stores answers.
4. The system marks the attempt as submitted.

### UC-011 - Grade Objective Questions

Actor: System

Goal: Automatically grade objective questions.

Main flow:

1. The system receives or loads a submitted exam attempt.
2. The system compares submitted answers with correct answers.
3. The system marks objective answers as correct or incorrect.
4. The system calculates the total score.
5. The system stores the graded result.

### UC-012 - View Exam Result

Actor: Student, Instructor

Goal: Review an exam result.

Main flow:

1. The user opens a result page.
2. The system loads the related student exam and answers.
3. The system displays score, correctness, and answer details.

### UC-013 - View Exam Results Summary

Actor: Instructor

Goal: Review all attempts for an exam.

Main flow:

1. The instructor opens an exam results page.
2. The system loads all student attempts for the exam.
3. The system displays result summaries.

### UC-014 - Manage Users

Actor: Admin

Goal: Manage user accounts.

Main flow:

1. The admin opens the user management page.
2. The system displays users.
3. The admin creates, updates, activates, or deactivates users.
4. The system saves the changes.

Status: Planned.

### UC-015 - Assign Roles

Actor: Admin

Goal: Assign roles to users.

Main flow:

1. The admin selects a user.
2. The admin selects a role.
3. The system updates the user's role assignment.

Status: Planned.

### UC-016 - Manage Categories

Actor: Admin

Goal: Maintain global question categories.

Main flow:

1. The admin opens category management.
2. The admin creates, updates, or deletes categories.
3. The system saves category changes.

Status: Planned.

### UC-017 - Monitor System Activity

Actor: Admin

Goal: Review system activity.

Main flow:

1. The admin opens activity monitoring.
2. The system displays important user and exam activities.
3. The admin reviews the activity data.

Status: Planned.

### UC-018 - Review System Reports

Actor: Admin

Goal: View high-level reports about platform usage and performance.

Main flow:

1. The admin opens reports.
2. The system displays usage and performance summaries.
3. The admin reviews report details.

Status: Planned.

### UC-019 - Create and Manage a Class

Actor: Instructor

Goal: Group students for targeted exam assignment.

Main flow:

1. The instructor opens the classes page.
2. The instructor creates a class with a name (and optional description).
3. The system stores the class and generates a unique join code.
4. The instructor shares the join code with students and can later view members, remove a student, or delete the class.

Status: Implemented.

### UC-020 - Join a Class

Actor: Student

Goal: Enroll in an instructor's class.

Main flow:

1. The student opens the classes page.
2. The student enters a join code.
3. The system validates the code and records the enrollment (rejecting duplicates).
4. Exams assigned to that class become visible to the student.

Status: Implemented.

### UC-021 - Assign an Exam to Classes

Actor: Instructor

Goal: Restrict an exam to specific classes.

Main flow:

1. The instructor opens an exam detail page.
2. The instructor sets visibility to "Selected classes" and selects one or more owned classes (or chooses "Public").
3. The system saves the visibility and the class assignments.
4. Only enrolled students of the assigned classes can list and start the exam (when visibility is CLASSES).

Status: Implemented.

## 7. Requirement Traceability

| Use Case | Related Requirements |
| --- | --- |
| UC-001 | FR-001, FR-002, FR-003, FR-004 |
| UC-002 | FR-001 |
| UC-003 | FR-003, FR-004 |
| UC-004 | FR-006, FR-007, FR-008, FR-009, FR-010, FR-011 |
| UC-005 | FR-012, FR-013, FR-017 |
| UC-006 | FR-014 |
| UC-007 | FR-015 |
| UC-008 | FR-018, FR-053 |
| UC-009 | FR-019, FR-020, FR-021, FR-053 |
| UC-010 | FR-022, FR-042 |
| UC-011 | FR-024, FR-025, FR-026, FR-027 |
| UC-012 | FR-028, FR-029, FR-030 |
| UC-013 | FR-029, FR-030, FR-031, FR-032 |
| UC-014 | FR-034, FR-035 |
| UC-015 | FR-005, FR-036 |
| UC-016 | FR-037 |
| UC-017 | FR-038 |
| UC-018 | FR-033 |
| UC-019 | FR-048, FR-049, FR-051 |
| UC-020 | FR-050 |
| UC-021 | FR-052, FR-053, FR-054 |

## 8. Current Prototype Gaps

The current prototype covers the full assessment lifecycle: question bank (with bulk import and per-question images), exam creation with optional question pools, exam taking with timer and auto-save, automatic grading and partial-credit manual grading, student/instructor results, question- and exam-level analytics, notifications, an account settings page, an audit log, and a role-aware redesigned UI. The following items remain as future work:

- In-app user management (activate/deactivate users, assign roles) — currently via the Keycloak admin console.
- Server-side persistence of in-progress answers (current auto-save is client-side localStorage).
- Proctoring / live monitoring during exams.
- An advanced admin reporting suite beyond current system totals and the audit log.
- Server-clock synchronization for exam time windows (browser time is used in places).
- Applying the new design to remaining secondary screens (Manual Grading, Bulk Import, My Results, Notifications, Admin Exam Detail) and the Keycloak login theme rollout.

## 9. User Stories

These user stories express the system requirements from each role's point of view. They were derived through AI-assisted question-and-answer sessions during requirements analysis, then reviewed and validated by the team, and finally reconciled against the implemented system. Each story references the functional requirement(s) it maps to.

### 9.1 Student

- US-001: As a student, I want to log in with my institutional account, so that I can access the system without managing a separate password. (→ FR-001, FR-002)
- US-002: As a student, I want to join a class with a join code, so that exams assigned to that class become available to me. (→ FR-050)
- US-003: As a student, I want to see only the exams available to me, so that I am not distracted by exams I cannot take. (→ FR-018, FR-053)
- US-004: As a student, I want to take an exam under a countdown timer, so that I work within the allotted time. (→ FR-019, FR-022)
- US-005: As a student, I want my in-progress answers preserved if I refresh or briefly disconnect, so that I do not lose work. (→ FR-020, FR-023, FR-041)
- US-006: As a student, I want to be prevented from retaking an exam I already submitted, so that exam integrity is preserved. (→ FR-021)
- US-007: As a student, I want to see my score and a per-question breakdown after grading, so that I understand my performance. (→ FR-028, FR-030)
- US-008: As a student, I want to export my result as a PDF, so that I can keep a personal record. (→ FR-047)
- US-009: As a student, I want to be notified when an exam is assigned to me or my exam is graded, so that I stay up to date. (→ FR-043, FR-054)

### 9.2 Instructor

- US-010: As an instructor, I want a reusable, categorized question bank, so that I can compose exams quickly. (→ FR-006, FR-010, FR-011)
- US-011: As an instructor, I want to author multiple question types (multiple choice, true/false, short answer), so that I can assess different skills. (→ FR-007, FR-008, FR-009)
- US-012: As an instructor, I want to attach an image to a question, so that I can ask visual or diagram-based questions. (→ FR-055)
- US-013: As an instructor, I want to bulk-import questions from a CSV file, so that I can add many questions efficiently. (→ FR-046)
- US-014: As an instructor, I want to create and schedule exams with a start/end time window, so that exams are available only when intended. (→ FR-012, FR-013)
- US-015: As an instructor, I want to deliver a random subset from a question pool to each student, so that I reduce cheating. (→ FR-016, FR-039)
- US-016: As an instructor, I want to publish and unpublish exams (publishing requiring at least one question), so that I control exam availability. (→ FR-015)
- US-017: As an instructor, I want to organize students into classes and assign exams to specific classes, so that only the intended students can access an exam. (→ FR-048, FR-052)
- US-018: As an instructor, I want to view enrolled students and remove a student from a class, so that I keep class membership accurate. (→ FR-051)
- US-019: As an instructor, I want open-ended answers routed to manual grading with partial credit and feedback, so that I can grade fairly. (→ FR-026)
- US-020: As an instructor, I want per-exam and per-question analytics (difficulty, discrimination, distribution), so that I can evaluate and improve my items. (→ FR-031, FR-032)
- US-021: As an instructor, I want only the owner and authorized roles to modify an exam, so that my exams are protected from unauthorized changes. (→ FR-017)

### 9.3 Admin

- US-022: As an admin, I want a system-wide dashboard with totals and role distribution, so that I can monitor platform usage. (→ FR-033, FR-034)
- US-023: As an admin, I want an append-only audit log of key actions, so that I can review who did what and when. (→ FR-038)
- US-024: As an admin, I want to manage global question categories, so that the question bank stays organized across instructors. (→ FR-037)

### 9.4 All Roles

- US-025: As any user, I want a role-aware interface that surfaces only my permitted actions, so that the app stays simple and safe. (→ FR-003, FR-004)
- US-026: As any user, I want to view my account and profile settings, so that I can check my identity information and manage my account. (→ FR-056)

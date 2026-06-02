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

The current prototype mainly implements Student and Instructor workflows. Admin is represented in the role model and Keycloak realm role definitions, but admin-specific user interfaces and backend management features are not fully implemented yet.

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
- Allow students to view available exams.
- Allow students to take and submit exams.
- Store student answers.
- Automatically grade objective questions.
- Show exam results to students and instructors.
- Allow admins to manage users, roles, categories, and system-level reports.

### 2.3 User Classes and Characteristics

#### Student

Students use the system to view available exams, take exams, submit answers, and review their results. They need a simple and reliable interface, especially during active exams.

#### Instructor

Instructors use the system to manage question banks, create exams, publish exams, and review student results. They need efficient workflows for assessment preparation and evaluation.

#### Admin

Admins manage system-wide users, roles, categories, and reports. Admin functionality is part of the target system scope, but the current prototype does not yet include a complete admin panel.

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
- FR-003: The system shall display role-based navigation options. Status: Partial.
- FR-004: The system shall support Student, Instructor, and Admin roles. Status: Partial.
- FR-005: The system shall allow admins to assign roles to users. Status: Planned.

### 3.2 Question Bank Management

- FR-006: The system shall allow instructors to create questions. Status: Implemented.
- FR-007: The system shall support multiple-choice questions. Status: Implemented.
- FR-008: The system shall support true/false questions. Status: Implemented.
- FR-009: The system shall support short-answer questions. Status: Partial.
- FR-010: The system shall allow questions to be associated with categories. Status: Partial.
- FR-011: The system shall allow instructors to view their own questions. Status: Implemented.

### 3.3 Exam Management

- FR-012: The system shall allow instructors to create exams. Status: Implemented.
- FR-013: The system shall allow instructors to define exam title, description, duration, start time, and end time. Status: Implemented.
- FR-014: The system shall allow instructors to add questions to exams. Status: Implemented.
- FR-015: The system shall allow instructors to publish exams. Status: Implemented.
- FR-016: The system shall support optional question randomization. Status: Partial.
- FR-017: The system shall prevent unauthorized users from modifying exams. Status: Partial.

### 3.4 Exam Taking

- FR-018: The system shall allow students to view published exams. Status: Implemented.
- FR-019: The system shall allow students to start an exam attempt. Status: Implemented.
- FR-020: The system shall allow students to continue an in-progress attempt. Status: Implemented.
- FR-021: The system shall prevent students from retaking an already submitted or graded exam. Status: Implemented.
- FR-022: The system shall allow students to submit answers. Status: Implemented.
- FR-023: The system shall provide real-time auto-save during exams. Status: Planned.

### 3.5 Grading and Results

- FR-024: The system shall automatically grade multiple-choice answers. Status: Implemented.
- FR-025: The system shall automatically grade true/false answers. Status: Implemented.
- FR-026: The system shall support manual grading for short-answer questions. Status: Planned.
- FR-027: The system shall calculate and store exam scores. Status: Implemented.
- FR-028: The system shall allow students to view their exam result. Status: Implemented.
- FR-029: The system shall allow instructors to view results for an exam. Status: Implemented.

### 3.6 Reporting and Analytics

- FR-030: The system shall show result summaries for student attempts. Status: Implemented.
- FR-031: The system shall provide question-level statistics. Status: Planned.
- FR-032: The system shall provide instructor-facing analytics for exam performance. Status: Planned.
- FR-033: The system shall provide admin-facing system reports. Status: Planned.

### 3.7 Administration

- FR-034: The system shall allow admins to view users. Status: Planned.
- FR-035: The system shall allow admins to activate or deactivate users. Status: Planned.
- FR-036: The system shall allow admins to manage user roles. Status: Planned.
- FR-037: The system shall allow admins to manage global categories. Status: Planned.
- FR-038: The system shall allow admins to monitor system activity. Status: Planned.

### 3.8 Academic Integrity and Reliability

- FR-039: The system shall support randomized question delivery to reduce cheating. Status: Partial.
- FR-040: The system shall support monitoring or proctoring mechanisms. Status: Planned.
- FR-041: The system shall preserve exam progress during temporary interruptions. Status: Planned.
- FR-042: The system shall prevent data loss during answer submission. Status: Partial.

## 4. External Interface Requirements

### 4.1 User Interfaces

The system shall provide browser-based interfaces for:

- Home page and login entry.
- Student dashboard.
- Instructor dashboard.
- Question bank.
- Exam creation and editing.
- Exam detail and question assignment.
- Exam-taking screen.
- Result pages.
- Future admin dashboard.

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
| UC-008 | FR-018 |
| UC-009 | FR-019, FR-020, FR-021 |
| UC-010 | FR-022, FR-042 |
| UC-011 | FR-024, FR-025, FR-026, FR-027 |
| UC-012 | FR-028, FR-029, FR-030 |
| UC-013 | FR-029, FR-030, FR-031, FR-032 |
| UC-014 | FR-034, FR-035 |
| UC-015 | FR-005, FR-036 |
| UC-016 | FR-037 |
| UC-017 | FR-038 |
| UC-018 | FR-033 |

## 8. Current Prototype Gaps

The current prototype is useful for demonstrating the main assessment flow, but the following target requirements need additional implementation:

- Complete Admin dashboard and backend management endpoints.
- Stronger backend authorization for all protected APIs.
- Manual grading workflow for short-answer questions.
- Real-time auto-save and session resilience during exams.
- Advanced reporting and analytics.
- Proctoring or monitoring features.
- More complete category management.
- Updated root documentation with correct encoding and current setup information.

package cse.quiz.system.service;

import cse.quiz.system.entity.Answer;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.exception.ConflictException;
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.exception.UnauthorizedException;
import cse.quiz.system.repository.AnswerRepository;
import cse.quiz.system.repository.QuestionRepository;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExamSubmissionService {

    private final StudentExamRepository studentExamRepository;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final GradingService gradingService;

    @Transactional
    public StudentExam submit(Long studentExamId, Map<String, String> answers) {
        StudentExam existing = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new NotFoundException("StudentExam not found"));

        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null || !currentUserId.equals(existing.getKeycloakUserId())) {
            throw new UnauthorizedException("Unauthorized");
        }

        if (existing.getStatus() != StudentExam.ExamStatus.IN_PROGRESS) {
            throw new ConflictException("Exam is not in progress");
        }

        if (existing.getExam() != null) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startedAt = existing.getStartedAt();
            Integer durationMin = existing.getExam().getDuration();
            if (startedAt != null && durationMin != null) {
                LocalDateTime hardDeadline = startedAt.plusMinutes(durationMin).plusSeconds(30);
                if (now.isAfter(hardDeadline)) {
                    existing.setStatus(StudentExam.ExamStatus.SUBMITTED);
                    existing.setSubmittedAt(now);
                    studentExamRepository.save(existing);
                    gradingService.gradeExam(studentExamId);
                    throw new ConflictException("Sınav süresi doldu, yeni cevap alınamaz");
                }
            }
            LocalDateTime examEnd = existing.getExam().getEndTime();
            if (examEnd != null && now.isAfter(examEnd.plusSeconds(30))) {
                existing.setStatus(StudentExam.ExamStatus.SUBMITTED);
                existing.setSubmittedAt(now);
                studentExamRepository.save(existing);
                gradingService.gradeExam(studentExamId);
                throw new ConflictException("Sınav süresi doldu, yeni cevap alınamaz");
            }
        }

        answers.forEach((questionIdStr, answerText) -> {
            if (answerText != null && !answerText.isBlank()) {
                Long questionId;
                try {
                    questionId = Long.parseLong(questionIdStr);
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Invalid question id: " + questionIdStr);
                }
                Answer answer = new Answer();
                answer.setStudentExam(existing);
                answer.setQuestion(questionRepository.getReferenceById(questionId));
                answer.setAnswerText(answerText);
                answerRepository.save(answer);
            }
        });

        existing.setStatus(StudentExam.ExamStatus.SUBMITTED);
        existing.setSubmittedAt(LocalDateTime.now());
        studentExamRepository.save(existing);

        gradingService.gradeExam(studentExamId);

        return studentExamRepository.findById(studentExamId).orElseThrow();
    }
}

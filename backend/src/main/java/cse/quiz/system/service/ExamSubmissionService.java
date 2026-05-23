package cse.quiz.system.service;

import cse.quiz.system.entity.Answer;
import cse.quiz.system.entity.StudentExam;
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
                .orElseThrow(() -> new RuntimeException("StudentExam not found"));

        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null || !currentUserId.equals(existing.getKeycloakUserId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (existing.getStatus() != StudentExam.ExamStatus.IN_PROGRESS) {
            throw new RuntimeException("Exam is not in progress");
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

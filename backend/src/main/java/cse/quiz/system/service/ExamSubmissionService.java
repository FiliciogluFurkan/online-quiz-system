package cse.quiz.system.service;

import cse.quiz.system.entity.Answer;
import cse.quiz.system.entity.ExamQuestion;
import cse.quiz.system.entity.Question;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.exception.ConflictException;
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.exception.UnauthorizedException;
import cse.quiz.system.repository.AnswerRepository;
import cse.quiz.system.repository.ExamQuestionRepository;
import cse.quiz.system.repository.QuestionRepository;
import cse.quiz.system.repository.StudentExamQuestionRepository;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExamSubmissionService {

    private final StudentExamRepository studentExamRepository;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final StudentExamQuestionRepository studentExamQuestionRepository;
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
            // Etkin başlangıç = max(başlama anı, sınav başlangıcı). Tarih sonradan
            // değiştirildiğinde eski başlama anı pencere dışına düşmesin.
            LocalDateTime examStart = existing.getExam().getStartTime();
            if (startedAt != null && examStart != null && startedAt.isBefore(examStart)) {
                startedAt = examStart;
            }
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

        // Öğrencinin bu sınavdaki TÜM soru kümesini belirle (havuzlu sınavda kişiye özel,
        // değilse sınavın soruları). Böylece boş bırakılan sorular da kayda geçer.
        Map<Long, Question> questionSet = new LinkedHashMap<>();
        List<Question> assigned = studentExamQuestionRepository.existsByStudentExamId(studentExamId)
                ? studentExamQuestionRepository.findQuestionsByStudentExamId(studentExamId)
                : (existing.getExam() != null
                    ? examQuestionRepository.findByExamId(existing.getExam().getId()).stream()
                        .map(ExamQuestion::getQuestion).toList()
                    : List.of());
        for (Question q : assigned) {
            if (q != null) questionSet.put(q.getId(), q);
        }

        // Gönderilen ama kümede olmayan cevapları da güvenlik amacıyla ekle
        answers.forEach((questionIdStr, answerText) -> {
            if (answerText == null || answerText.isBlank()) return;
            Long questionId;
            try {
                questionId = Long.parseLong(questionIdStr);
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid question id: " + questionIdStr);
            }
            questionSet.computeIfAbsent(questionId, questionRepository::getReferenceById);
        });

        // Her soru için bir cevap kaydı: cevaplanmayanlar boş ("") olarak işaretlenir
        for (Question q : questionSet.values()) {
            String answerText = answers.get(String.valueOf(q.getId()));
            Answer answer = new Answer();
            answer.setStudentExam(existing);
            answer.setQuestion(q);
            answer.setAnswerText(answerText != null ? answerText : "");
            answerRepository.save(answer);
        }

        existing.setStatus(StudentExam.ExamStatus.SUBMITTED);
        existing.setSubmittedAt(LocalDateTime.now());
        studentExamRepository.save(existing);

        gradingService.gradeExam(studentExamId);

        return studentExamRepository.findById(studentExamId).orElseThrow();
    }
}

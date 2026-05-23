package cse.quiz.system.controller;

import cse.quiz.system.entity.Answer;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.exception.UnauthorizedException;
import cse.quiz.system.repository.AnswerRepository;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.service.GradingService;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {
    private final StudentExamRepository studentExamRepository;
    private final AnswerRepository answerRepository;
    private final GradingService gradingService;

    @PostMapping("/grade/{studentExamId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Map<String, Object> gradeExam(@PathVariable Long studentExamId) {
        gradingService.gradeExam(studentExamId);
        
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new NotFoundException("StudentExam not found"));

        Map<String, Object> result = new HashMap<>();
        result.put("score", studentExam.getScore());
        result.put("status", studentExam.getStatus());
        result.put("message", "Sınav başarıyla puanlandı!");
        
        return result;
    }

    @GetMapping("/student-exam/{studentExamId}")
    public Map<String, Object> getExamResult(@PathVariable Long studentExamId) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new NotFoundException("StudentExam not found"));

        String currentUserId = SecurityUtils.getCurrentUserId();
        if (!SecurityUtils.hasAnyRole("INSTRUCTOR", "ADMIN")
                && (currentUserId == null || !currentUserId.equals(studentExam.getKeycloakUserId()))) {
            throw new UnauthorizedException("Unauthorized");
        }
        
        List<Answer> answers = answerRepository.findByStudentExamId(studentExamId);
        
        long correctCount = answers.stream()
                .filter(a -> a.getIsCorrect() != null && a.getIsCorrect())
                .count();
        
        long incorrectCount = answers.stream()
                .filter(a -> a.getIsCorrect() != null && !a.getIsCorrect())
                .count();
        
        long unansweredCount = answers.stream()
                .filter(a -> a.getAnswerText() == null || a.getAnswerText().isEmpty())
                .count();
        
        Map<String, Object> result = new HashMap<>();
        result.put("studentExam", studentExam);
        result.put("answers", answers);
        result.put("correctCount", correctCount);
        result.put("incorrectCount", incorrectCount);
        result.put("unansweredCount", unansweredCount);
        result.put("totalQuestions", answers.size());
        
        return result;
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public List<StudentExam> getExamResults(@PathVariable Long examId) {
        return studentExamRepository.findByExamId(examId);
    }
    
    @GetMapping("/exam/{examId}/statistics")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Map<String, Object> getExamStatistics(@PathVariable Long examId) {
        List<StudentExam> studentExams = studentExamRepository.findByExamId(examId);
        List<Answer> allAnswers = new java.util.ArrayList<>();
        
        for (StudentExam se : studentExams) {
            if (se.getStatus() == StudentExam.ExamStatus.GRADED || 
                se.getStatus() == StudentExam.ExamStatus.SUBMITTED) {
                allAnswers.addAll(answerRepository.findByStudentExamId(se.getId()));
            }
        }
        
        // Genel istatistikler
        long completedCount = studentExams.stream()
            .filter(se -> se.getStatus() == StudentExam.ExamStatus.GRADED || 
                         se.getStatus() == StudentExam.ExamStatus.SUBMITTED)
            .count();
        
        double averageScore = studentExams.stream()
            .filter(se -> se.getStatus() == StudentExam.ExamStatus.GRADED)
            .mapToDouble(StudentExam::getScore)
            .average()
            .orElse(0.0);
        
        double maxScore = studentExams.stream()
            .filter(se -> se.getStatus() == StudentExam.ExamStatus.GRADED)
            .mapToDouble(StudentExam::getScore)
            .max()
            .orElse(0.0);
        
        double minScore = studentExams.stream()
            .filter(se -> se.getStatus() == StudentExam.ExamStatus.GRADED)
            .mapToDouble(StudentExam::getScore)
            .min()
            .orElse(0.0);
        
        // Soru bazlı istatistikler
        Map<Long, Map<String, Object>> questionStats = new java.util.HashMap<>();
        
        allAnswers.stream()
            .collect(java.util.stream.Collectors.groupingBy(a -> a.getQuestion().getId()))
            .forEach((questionId, answers) -> {
                long totalAnswers = answers.size();
                long correctAnswers = answers.stream()
                    .filter(a -> a.getIsCorrect() != null && a.getIsCorrect())
                    .count();
                long incorrectAnswers = answers.stream()
                    .filter(a -> a.getIsCorrect() != null && !a.getIsCorrect())
                    .count();
                
                double successRate = totalAnswers > 0 ? (correctAnswers * 100.0 / totalAnswers) : 0.0;
                
                Map<String, Object> stat = new java.util.HashMap<>();
                stat.put("question", answers.get(0).getQuestion());
                stat.put("totalAnswers", totalAnswers);
                stat.put("correctAnswers", correctAnswers);
                stat.put("incorrectAnswers", incorrectAnswers);
                stat.put("successRate", successRate);
                
                questionStats.put(questionId, stat);
            });
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalParticipants", studentExams.size());
        result.put("completedCount", completedCount);
        result.put("averageScore", averageScore);
        result.put("maxScore", maxScore);
        result.put("minScore", minScore);
        result.put("questionStatistics", questionStats.values());
        
        return result;
    }
    
    @GetMapping("/my-results")
    public List<StudentExam> getMyResults() {
        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new RuntimeException("User not authenticated");
        }
        return studentExamRepository.findByKeycloakUserId(currentUserId);
    }

    @PutMapping("/answer/{answerId}/grade")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Answer gradeAnswer(@PathVariable Long answerId, @RequestBody Map<String, Object> gradeData) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new NotFoundException("Answer not found"));
        
        Integer pointsEarned = ((Number) gradeData.get("pointsEarned")).intValue();
        answer.setPointsEarned(pointsEarned);
        
        // Puanı sorunun maksimum puanıyla karşılaştır
        Integer maxPoints = answer.getQuestion().getPoints();
        
        if (pointsEarned >= maxPoints) {
            answer.setIsCorrect(true);
        } else if (pointsEarned > 0) {
            answer.setIsCorrect(null); // Kısmi puan
        } else {
            answer.setIsCorrect(false);
        }
        
        answerRepository.save(answer);
        
        // Toplam puanı yeniden hesapla
        recalculateStudentExamScore(answer.getStudentExam().getId());
        
        return answer;
    }
    
    private void recalculateStudentExamScore(Long studentExamId) {
        List<Answer> answers = answerRepository.findByStudentExamId(studentExamId);
        
        double totalScore = answers.stream()
                .mapToDouble(a -> a.getPointsEarned() != null ? a.getPointsEarned().doubleValue() : 0.0)
                .sum();
        
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new NotFoundException("StudentExam not found"));

        studentExam.setScore(totalScore);
        studentExam.setStatus(StudentExam.ExamStatus.GRADED);
        studentExamRepository.save(studentExam);
    }
}

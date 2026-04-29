package cse.quiz.system.controller;

import cse.quiz.system.entity.Answer;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.repository.AnswerRepository;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.service.GradingService;
import lombok.RequiredArgsConstructor;
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
    public Map<String, Object> gradeExam(@PathVariable Long studentExamId) {
        gradingService.gradeExam(studentExamId);
        
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("StudentExam not found"));
        
        Map<String, Object> result = new HashMap<>();
        result.put("score", studentExam.getScore());
        result.put("status", studentExam.getStatus());
        result.put("message", "Sınav başarıyla puanlandı!");
        
        return result;
    }

    @GetMapping("/student-exam/{studentExamId}")
    public Map<String, Object> getExamResult(@PathVariable Long studentExamId) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("StudentExam not found"));
        
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
    public List<StudentExam> getExamResults(@PathVariable Long examId) {
        return studentExamRepository.findByExamId(examId);
    }
}

package cse.quiz.system.controller;

import cse.quiz.system.entity.ExamQuestion;
import cse.quiz.system.repository.ExamQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/exam-questions")
@RequiredArgsConstructor
public class ExamQuestionController {
    private final ExamQuestionRepository examQuestionRepository;

    @GetMapping("/exam/{examId}")
    public List<ExamQuestion> getExamQuestions(@PathVariable Long examId) {
        return examQuestionRepository.findByExamId(examId);
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ExamQuestion addQuestionToExam(@RequestBody ExamQuestion examQuestion) {
        return examQuestionRepository.save(examQuestion);
    }
}

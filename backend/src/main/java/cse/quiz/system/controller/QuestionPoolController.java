package cse.quiz.system.controller;

import cse.quiz.system.entity.Question;
import cse.quiz.system.service.QuestionPoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/question-pool")
@RequiredArgsConstructor
public class QuestionPoolController {
    private final QuestionPoolService questionPoolService;

    @PostMapping("/exam/{examId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public void addQuestionsToPool(@PathVariable Long examId, @RequestBody Map<String, List<Long>> payload) {
        List<Long> questionIds = payload.get("questionIds");
        questionPoolService.addQuestionsToPool(examId, questionIds);
    }

    @GetMapping("/exam/{examId}")
    public List<Question> getPoolQuestions(@PathVariable Long examId) {
        return questionPoolService.getPoolQuestions(examId);
    }

    @PostMapping("/student-exam/{studentExamId}/assign")
    public List<Question> assignRandomQuestions(@PathVariable Long studentExamId) {
        return questionPoolService.assignRandomQuestions(studentExamId);
    }

    @GetMapping("/student-exam/{studentExamId}")
    public List<Question> getAssignedQuestions(@PathVariable Long studentExamId) {
        return questionPoolService.getAssignedQuestions(studentExamId);
    }
}

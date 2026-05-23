package cse.quiz.system.controller;

import cse.quiz.system.dto.ExamQuestionStudentDto;
import cse.quiz.system.entity.ExamQuestion;
import cse.quiz.system.repository.ExamQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exam-questions")
@RequiredArgsConstructor
public class ExamQuestionController {
    private final ExamQuestionRepository examQuestionRepository;

    @GetMapping("/exam/{examId}")
    public List<ExamQuestionStudentDto> getExamQuestions(@PathVariable Long examId) {
        return examQuestionRepository.findByExamId(examId).stream()
                .map(ExamQuestionStudentDto::from)
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ExamQuestion addQuestionToExam(@RequestBody ExamQuestion examQuestion) {
        return examQuestionRepository.save(examQuestion);
    }
}

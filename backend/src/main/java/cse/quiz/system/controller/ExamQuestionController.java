package cse.quiz.system.controller;

import cse.quiz.system.dto.ExamQuestionStudentDto;
import cse.quiz.system.entity.ExamQuestion;
import cse.quiz.system.entity.Question;
import cse.quiz.system.repository.ExamQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

    @GetMapping("/exam/{examId}/full")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public List<Map<String, Object>> getExamQuestionsFull(@PathVariable Long examId) {
        return examQuestionRepository.findByExamId(examId).stream()
                .map(eq -> {
                    Question q = eq.getQuestion();
                    Map<String, Object> qMap = new LinkedHashMap<>();
                    qMap.put("id", q.getId());
                    qMap.put("type", q.getType());
                    qMap.put("questionText", q.getQuestionText());
                    qMap.put("options", q.getOptions());
                    qMap.put("imageUrl", q.getImageUrl());
                    qMap.put("correctAnswer", q.getCorrectAnswer());
                    qMap.put("points", q.getPoints());
                    qMap.put("category", q.getCategory());

                    Map<String, Object> wrap = new LinkedHashMap<>();
                    wrap.put("id", eq.getId());
                    wrap.put("orderIndex", eq.getOrderIndex());
                    wrap.put("question", qMap);
                    return wrap;
                })
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ExamQuestion addQuestionToExam(@RequestBody ExamQuestion examQuestion) {
        return examQuestionRepository.save(examQuestion);
    }

    /** Bir soruyu sınavdan çıkarır (soru bankasından silinmez). */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public void removeQuestionFromExam(@PathVariable Long id) {
        // Kayıt yoksa sessizce geç (EmptyResultDataAccessException ile 500 dönmesin)
        examQuestionRepository.findById(id).ifPresent(examQuestionRepository::delete);
    }
}

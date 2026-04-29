package cse.quiz.system.controller;

import cse.quiz.system.entity.Question;
import cse.quiz.system.repository.QuestionRepository;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionRepository questionRepository;

    @GetMapping
    public List<Question> getAllQuestions() {
        String currentUserId = SecurityUtils.getCurrentUserId();
        
        // Eğer INSTRUCTOR ise sadece kendi sorularını göster
        if (currentUserId != null) {
            return questionRepository.findByKeycloakCreatorId(currentUserId);
        }
        
        // Fallback: Tüm soruları göster
        return questionRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Question createQuestion(@RequestBody Question question) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId != null) {
            question.setKeycloakCreatorId(currentUserId);
        }
        return questionRepository.save(question);
    }
}

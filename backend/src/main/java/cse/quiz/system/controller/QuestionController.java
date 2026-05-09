package cse.quiz.system.controller;

import cse.quiz.system.entity.Category;
import cse.quiz.system.entity.Question;
import cse.quiz.system.repository.CategoryRepository;
import cse.quiz.system.repository.QuestionRepository;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;

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
    
    @PostMapping("/bulk-import")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Map<String, Object> bulkImport(@RequestParam("file") MultipartFile file) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        List<Question> importedQuestions = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int lineNumber = 0;
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            // Skip header
            reader.readLine();
            lineNumber++;
            
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                try {
                    String[] parts = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
                    
                    if (parts.length < 4) {
                        errors.add("Satır " + lineNumber + ": Eksik alan");
                        continue;
                    }
                    
                    Question question = new Question();
                    question.setQuestionText(parts[0].replace("\"", "").trim());
                    question.setType(Question.QuestionType.valueOf(parts[1].trim()));
                    question.setOptions(parts.length > 2 && !parts[2].trim().isEmpty() ? parts[2].replace("\"", "").trim() : null);
                    question.setCorrectAnswer(parts[3].replace("\"", "").trim());
                    question.setPoints(parts.length > 4 && !parts[4].trim().isEmpty() ? Integer.parseInt(parts[4].trim()) : 1);
                    
                    // Kategori
                    if (parts.length > 5 && !parts[5].trim().isEmpty()) {
                        try {
                            Long categoryId = Long.parseLong(parts[5].trim());
                            Category category = categoryRepository.findById(categoryId).orElse(null);
                            question.setCategory(category);
                        } catch (NumberFormatException e) {
                            // Kategori ID geçersiz, atla
                        }
                    }
                    
                    if (currentUserId != null) {
                        question.setKeycloakCreatorId(currentUserId);
                    }
                    
                    importedQuestions.add(questionRepository.save(question));
                } catch (Exception e) {
                    errors.add("Satır " + lineNumber + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            errors.add("Dosya okuma hatası: " + e.getMessage());
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("imported", importedQuestions.size());
        result.put("errors", errors);
        result.put("questions", importedQuestions);
        
        return result;
    }
}

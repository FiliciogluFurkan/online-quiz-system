package cse.quiz.system.controller;

import cse.quiz.system.dto.QuestionBulkRequest;
import cse.quiz.system.entity.Category;
import cse.quiz.system.entity.Question;
import cse.quiz.system.exception.ConflictException;
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.exception.UnauthorizedException;
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
import java.util.LinkedHashMap;

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

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Question updateQuestion(@PathVariable Long id, @RequestBody Question incoming) {
        Question existing = questionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Soru bulunamadı"));

        String currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.hasAnyRole("ADMIN");
        if (!isAdmin && (currentUserId == null
                || !currentUserId.equals(existing.getKeycloakCreatorId()))) {
            throw new UnauthorizedException("Bu soruyu düzenleme yetkiniz yok");
        }

        existing.setQuestionText(incoming.getQuestionText());
        existing.setType(incoming.getType());
        existing.setOptions(incoming.getOptions());
        existing.setCorrectAnswer(incoming.getCorrectAnswer());
        existing.setPoints(incoming.getPoints());
        existing.setCategory(incoming.getCategory());
        existing.setImageUrl(incoming.getImageUrl());
        return questionRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public void deleteQuestion(@PathVariable Long id) {
        Question existing = questionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Soru bulunamadı"));

        String currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.hasAnyRole("ADMIN");
        if (!isAdmin && (currentUserId == null
                || !currentUserId.equals(existing.getKeycloakCreatorId()))) {
            throw new UnauthorizedException("Bu soruyu silme yetkiniz yok");
        }

        questionRepository.delete(existing);
    }
    
    @GetMapping("/{id}/full")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Map<String, Object> getQuestionFull(@PathVariable Long id) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        return toFullMap(q);
    }

    /**
     * Eğitmenin kendi sorularını DOĞRU CEVAP dahil döndürür (soru bankası listesi için).
     * Varlık üzerindeki correctAnswer alanı WRITE_ONLY olduğundan normal /questions
     * yanıtında gelmez; bu uç manuel Map ile cevabı da içerir.
     */
    @GetMapping("/manage")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public List<Map<String, Object>> getManagedQuestions() {
        return ownedOrAllQuestions().stream().map(this::toFullMap).toList();
    }

    /** Henüz hiçbir kategoriye atanmamış sorular (kategoriye toplu ekleme için). */
    @GetMapping("/uncategorized")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public List<Map<String, Object>> getUncategorizedQuestions() {
        return ownedOrAllQuestions().stream()
                .filter(q -> q.getCategory() == null)
                .map(this::toFullMap)
                .toList();
    }

    /** Belirli bir kategoriye ait sorular (kategori düzenleme ekranında listelemek için). */
    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public List<Map<String, Object>> getQuestionsByCategory(@PathVariable Long categoryId) {
        return ownedOrAllQuestions().stream()
                .filter(q -> q.getCategory() != null && categoryId.equals(q.getCategory().getId()))
                .map(this::toFullMap)
                .toList();
    }

    /** Verilen soruları bir kategoriye (categoryId null ise kategorisiz) toplu atar. */
    @PutMapping("/bulk-category")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Map<String, Object> bulkAssignCategory(@RequestBody QuestionBulkRequest req) {
        if (req.questionIds() == null || req.questionIds().isEmpty()) {
            throw new ConflictException("En az bir soru seçmelisiniz");
        }
        Category category = null;
        if (req.categoryId() != null) {
            category = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> new NotFoundException("Kategori bulunamadı"));
        }
        int updated = 0;
        for (Long id : req.questionIds()) {
            Question q = questionRepository.findById(id).orElse(null);
            if (q == null || !canManage(q)) continue;
            q.setCategory(category);
            questionRepository.save(q);
            updated++;
        }
        return Map.of("updated", updated);
    }

    /** Verilen soruları toplu siler; sınavda kullanılanlar atlanır ve raporlanır. */
    @PostMapping("/bulk-delete")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Map<String, Object> bulkDelete(@RequestBody QuestionBulkRequest req) {
        if (req.questionIds() == null || req.questionIds().isEmpty()) {
            throw new ConflictException("En az bir soru seçmelisiniz");
        }
        int deleted = 0;
        List<Long> failed = new ArrayList<>();
        for (Long id : req.questionIds()) {
            Question q = questionRepository.findById(id).orElse(null);
            if (q == null || !canManage(q)) {
                if (q != null) failed.add(id);
                continue;
            }
            try {
                questionRepository.delete(q);
                questionRepository.flush();
                deleted++;
            } catch (Exception e) {
                // Genelde bir sınavda kullanılan soru (FK kısıtı)
                failed.add(id);
            }
        }
        Map<String, Object> result = new HashMap<>();
        result.put("deleted", deleted);
        result.put("failed", failed);
        return result;
    }

    /** Geçerli kullanıcının yönetebildiği soru kümesi (admin tümü, eğitmen kendisininkiler). */
    private List<Question> ownedOrAllQuestions() {
        String currentUserId = SecurityUtils.getCurrentUserId();
        if (SecurityUtils.hasAnyRole("ADMIN")) {
            return questionRepository.findAll();
        }
        if (currentUserId != null) {
            return questionRepository.findByKeycloakCreatorId(currentUserId);
        }
        return questionRepository.findAll();
    }

    private boolean canManage(Question q) {
        if (SecurityUtils.hasAnyRole("ADMIN")) return true;
        String currentUserId = SecurityUtils.getCurrentUserId();
        return currentUserId != null && currentUserId.equals(q.getKeycloakCreatorId());
    }

    private Map<String, Object> toFullMap(Question q) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", q.getId());
        map.put("type", q.getType());
        map.put("questionText", q.getQuestionText());
        map.put("options", q.getOptions());
        map.put("imageUrl", q.getImageUrl());
        map.put("correctAnswer", q.getCorrectAnswer());
        map.put("points", q.getPoints());
        map.put("category", q.getCategory());
        map.put("keycloakCreatorId", q.getKeycloakCreatorId());
        return map;
    }

    @PostMapping("/bulk-import")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Map<String, Object> bulkImport(@RequestParam("file") MultipartFile file,
            @RequestParam(value = "categoryId", required = false) Long categoryId) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        // Opsiyonel: seçilen kategori tüm içe aktarılan sorulara uygulanır (CSV kolonundan önceliklidir)
        Category selectedCategory = null;
        if (categoryId != null) {
            selectedCategory = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new NotFoundException("Kategori bulunamadı"));
        }
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
                    question.setOptions(parts.length > 2 && !parts[2].trim().isEmpty() ? parts[2].replace("\"", "").trim().replace("\\n", "\n") : null);
                    question.setCorrectAnswer(parts[3].replace("\"", "").trim());
                    question.setPoints(parts.length > 4 && !parts[4].trim().isEmpty() ? Integer.parseInt(parts[4].trim()) : 1);
                    
                    // Kategori: UI'dan seçilen kategori önceliklidir, yoksa CSV'deki Kategori ID kolonu
                    if (selectedCategory != null) {
                        question.setCategory(selectedCategory);
                    } else if (parts.length > 5 && !parts[5].trim().isEmpty()) {
                        try {
                            Long csvCategoryId = Long.parseLong(parts[5].trim());
                            Category category = categoryRepository.findById(csvCategoryId).orElse(null);
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

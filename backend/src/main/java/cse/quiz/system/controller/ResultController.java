package cse.quiz.system.controller;

import cse.quiz.system.entity.Answer;
import cse.quiz.system.entity.Category;
import cse.quiz.system.entity.ExamQuestion;
import cse.quiz.system.entity.Question;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.exception.UnauthorizedException;
import cse.quiz.system.repository.AnswerRepository;
import cse.quiz.system.repository.ExamQuestionRepository;
import cse.quiz.system.repository.StudentExamQuestionRepository;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.service.AuditLogService;
import cse.quiz.system.service.GradingService;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {
    private final StudentExamRepository studentExamRepository;
    private final AnswerRepository answerRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final StudentExamQuestionRepository studentExamQuestionRepository;
    private final GradingService gradingService;
    private final AuditLogService auditLogService;

    /** Sınavın toplam puanı: öğrencinin soru kümesindeki soruların puan toplamı. */
    private double totalPointsFor(StudentExam se) {
        List<Question> qs;
        if (studentExamQuestionRepository.existsByStudentExamId(se.getId())) {
            qs = studentExamQuestionRepository.findQuestionsByStudentExamId(se.getId());
        } else if (se.getExam() != null) {
            qs = examQuestionRepository.findByExamId(se.getExam().getId()).stream()
                    .map(ExamQuestion::getQuestion).toList();
        } else {
            qs = List.of();
        }
        return qs.stream().mapToInt(q -> q.getPoints() != null ? q.getPoints() : 0).sum();
    }

    @PostMapping("/grade/{studentExamId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Map<String, Object> gradeExam(@PathVariable Long studentExamId) {
        gradingService.gradeExam(studentExamId);

        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new NotFoundException("StudentExam not found"));

        auditLogService.record("StudentExam", studentExamId, "GRADE",
                "score=" + studentExam.getScore());

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
    public List<Map<String, Object>> getExamResults(@PathVariable Long examId) {
        List<StudentExam> studentExams = studentExamRepository.findByExamId(examId);
        
        List<Map<String, Object>> results = new ArrayList<>();
        for (StudentExam se : studentExams) {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", se.getId());
            dto.put("status", se.getStatus());
            dto.put("score", se.getScore());
            dto.put("startedAt", se.getStartedAt());
            dto.put("submittedAt", se.getSubmittedAt());
            dto.put("student", se.getStudent());
            
            // Calculate maxScore from answers
            List<Answer> answers = answerRepository.findByStudentExamId(se.getId());
            int maxScore = answers.stream()
                    .mapToInt(a -> a.getQuestion() != null && a.getQuestion().getPoints() != null 
                              ? a.getQuestion().getPoints() : 0)
                    .sum();
            
            dto.put("maxScore", maxScore > 0 ? maxScore : 100);
            results.add(dto);
        }
        
        return results;
    public List<StudentExam> getExamResults(@PathVariable Long examId) {
        List<StudentExam> list = studentExamRepository.findByExamId(examId);
        list.forEach(se -> se.setMaxScore(totalPointsFor(se)));
        return list;
    }
    
    @GetMapping("/exam/{examId}/statistics")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Map<String, Object> getExamStatistics(@PathVariable Long examId) {
        List<StudentExam> studentExams = studentExamRepository.findByExamId(examId);

        // Graded subset, sorted desc by score — used for upper/lower 27% groups
        List<StudentExam> graded = new ArrayList<>();
        for (StudentExam se : studentExams) {
            if (se.getStatus() == StudentExam.ExamStatus.GRADED && se.getScore() != null) {
                graded.add(se);
            }
        }
        graded.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        int n = graded.size();
        int groupSize = (int) Math.max(1, Math.round(n * 0.27));
        java.util.Set<Long> upperIds = new java.util.HashSet<>();
        java.util.Set<Long> lowerIds = new java.util.HashSet<>();
        for (int i = 0; i < Math.min(groupSize, n); i++) upperIds.add(graded.get(i).getId());
        for (int i = Math.max(0, n - groupSize); i < n; i++) lowerIds.add(graded.get(i).getId());

        List<Answer> allAnswers = new ArrayList<>();
        for (StudentExam se : studentExams) {
            if (se.getStatus() == StudentExam.ExamStatus.GRADED ||
                se.getStatus() == StudentExam.ExamStatus.SUBMITTED) {
                allAnswers.addAll(answerRepository.findByStudentExamId(se.getId()));
            }
        }

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

        Map<Long, Map<String, Object>> questionStats = new HashMap<>();

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

                // Discrimination index: (upper correct ratio) - (lower correct ratio)
                int upperTotal = 0, upperCorrect = 0, lowerTotal = 0, lowerCorrect = 0;
                for (Answer a : answers) {
                    Long seId = a.getStudentExam() != null ? a.getStudentExam().getId() : null;
                    if (seId == null) continue;
                    boolean correct = a.getIsCorrect() != null && a.getIsCorrect();
                    if (upperIds.contains(seId)) {
                        upperTotal++;
                        if (correct) upperCorrect++;
                    }
                    if (lowerIds.contains(seId)) {
                        lowerTotal++;
                        if (correct) lowerCorrect++;
                    }
                }
                Double discriminationIndex = null;
                if (upperTotal > 0 && lowerTotal > 0) {
                    double up = upperCorrect * 1.0 / upperTotal;
                    double lo = lowerCorrect * 1.0 / lowerTotal;
                    discriminationIndex = Math.round((up - lo) * 1000.0) / 1000.0;
                }

                // Option distribution (for multiple-choice distractor analysis)
                Map<String, Integer> optionDistribution = new HashMap<>();
                for (Answer a : answers) {
                    String txt = a.getAnswerText();
                    if (txt == null || txt.isBlank()) continue;
                    optionDistribution.merge(txt, 1, Integer::sum);
                }

                Map<String, Object> stat = new HashMap<>();
                stat.put("question", answers.get(0).getQuestion());
                stat.put("totalAnswers", totalAnswers);
                stat.put("correctAnswers", correctAnswers);
                stat.put("incorrectAnswers", incorrectAnswers);
                stat.put("successRate", successRate);
                stat.put("difficultyIndex", Math.round(successRate) / 100.0);
                stat.put("discriminationIndex", discriminationIndex);
                stat.put("optionDistribution", optionDistribution);

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
    
    @GetMapping("/student-exam/{studentExamId}/by-category")
    public Map<String, Object> getResultByCategory(@PathVariable Long studentExamId) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new NotFoundException("StudentExam not found"));

        String currentUserId = SecurityUtils.getCurrentUserId();
        if (!SecurityUtils.hasAnyRole("INSTRUCTOR", "ADMIN")
                && (currentUserId == null || !currentUserId.equals(studentExam.getKeycloakUserId()))) {
            throw new UnauthorizedException("Unauthorized");
        }

        List<Answer> answers = answerRepository.findByStudentExamId(studentExamId);

        Map<Long, Map<String, Object>> byCategory = new LinkedHashMap<>();
        Map<String, Object> uncategorized = new HashMap<>();
        uncategorized.put("questionCount", 0);
        uncategorized.put("earnedPoints", 0);
        uncategorized.put("totalPoints", 0);

        for (Answer a : answers) {
            Question q = a.getQuestion();
            if (q == null) continue;
            int earned = a.getPointsEarned() != null ? a.getPointsEarned() : 0;
            int total = q.getPoints() != null ? q.getPoints() : 0;
            Category cat = q.getCategory();
            if (cat == null) {
                uncategorized.put("questionCount", (int) uncategorized.get("questionCount") + 1);
                uncategorized.put("earnedPoints", (int) uncategorized.get("earnedPoints") + earned);
                uncategorized.put("totalPoints", (int) uncategorized.get("totalPoints") + total);
                continue;
            }
            Map<String, Object> bucket = byCategory.computeIfAbsent(cat.getId(), id -> {
                Map<String, Object> m = new HashMap<>();
                m.put("categoryId", cat.getId());
                m.put("categoryName", cat.getName());
                m.put("questionCount", 0);
                m.put("earnedPoints", 0);
                m.put("totalPoints", 0);
                return m;
            });
            bucket.put("questionCount", (int) bucket.get("questionCount") + 1);
            bucket.put("earnedPoints", (int) bucket.get("earnedPoints") + earned);
            bucket.put("totalPoints", (int) bucket.get("totalPoints") + total);
        }

        List<Map<String, Object>> categories = new ArrayList<>(byCategory.values());
        for (Map<String, Object> bucket : categories) {
            int earned = (int) bucket.get("earnedPoints");
            int total = (int) bucket.get("totalPoints");
            bucket.put("successRate", total > 0 ? earned * 100.0 / total : 0.0);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("studentExamId", studentExamId);
        result.put("categories", categories);
        if ((int) uncategorized.get("questionCount") > 0) {
            int earned = (int) uncategorized.get("earnedPoints");
            int total = (int) uncategorized.get("totalPoints");
            uncategorized.put("successRate", total > 0 ? earned * 100.0 / total : 0.0);
            result.put("uncategorized", uncategorized);
        }
        return result;
    }

    @GetMapping("/exam/{examId}/aggregate")
    public Map<String, Object> getExamAggregate(@PathVariable Long examId) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        boolean isStaff = SecurityUtils.hasAnyRole("INSTRUCTOR", "ADMIN");

        List<StudentExam> all = studentExamRepository.findByExamId(examId);

        if (!isStaff) {
            boolean isParticipant = currentUserId != null && all.stream()
                    .anyMatch(se -> currentUserId.equals(se.getKeycloakUserId()));
            if (!isParticipant) {
                throw new UnauthorizedException("Unauthorized");
            }
        }

        List<Double> scores = new ArrayList<>();
        for (StudentExam se : all) {
            if (se.getStatus() == StudentExam.ExamStatus.GRADED && se.getScore() != null) {
                scores.add(se.getScore());
            }
        }
        Collections.sort(scores);

        Map<String, Object> result = new HashMap<>();
        result.put("examId", examId);
        result.put("classSize", all.size());
        result.put("completedCount", scores.size());

        if (scores.isEmpty()) {
            result.put("average", null);
            result.put("median", null);
            result.put("max", null);
            result.put("min", null);
            result.put("stdDev", null);
            result.put("histogram", emptyHistogram());
            result.put("yourScore", null);
            result.put("yourPercentile", null);
            return result;
        }

        double sum = 0;
        for (double s : scores) sum += s;
        double avg = sum / scores.size();
        double sqSum = 0;
        for (double s : scores) sqSum += (s - avg) * (s - avg);
        double stdDev = Math.sqrt(sqSum / scores.size());

        result.put("average", round2(avg));
        result.put("median", round2(percentile(scores, 50)));
        result.put("max", scores.get(scores.size() - 1));
        result.put("min", scores.get(0));
        result.put("stdDev", round2(stdDev));
        result.put("histogram", buildHistogram(scores));

        Double yourScore = null;
        Double yourPercentile = null;
        if (currentUserId != null) {
            for (StudentExam se : all) {
                if (currentUserId.equals(se.getKeycloakUserId())
                        && se.getStatus() == StudentExam.ExamStatus.GRADED
                        && se.getScore() != null) {
                    yourScore = se.getScore();
                    yourPercentile = round2(percentileRank(scores, yourScore));
                    break;
                }
            }
        }
        result.put("yourScore", yourScore);
        result.put("yourPercentile", yourPercentile);
        return result;
    }

    private double percentile(List<Double> sorted, double p) {
        if (sorted.isEmpty()) return 0;
        double rank = (p / 100.0) * (sorted.size() - 1);
        int lo = (int) Math.floor(rank);
        int hi = (int) Math.ceil(rank);
        if (lo == hi) return sorted.get(lo);
        double w = rank - lo;
        return sorted.get(lo) * (1 - w) + sorted.get(hi) * w;
    }

    private double percentileRank(List<Double> sorted, double value) {
        if (sorted.isEmpty()) return 0;
        int below = 0;
        int equal = 0;
        for (double s : sorted) {
            if (s < value) below++;
            else if (s == value) equal++;
        }
        return (below + 0.5 * equal) * 100.0 / sorted.size();
    }

    private Map<String, Object> buildHistogram(List<Double> scores) {
        int[] counts = new int[10];
        int[] edges = {0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        for (double s : scores) {
            int idx = (int) Math.floor(s / 10.0);
            if (idx < 0) idx = 0;
            if (idx > 9) idx = 9;
            counts[idx]++;
        }
        Map<String, Object> h = new HashMap<>();
        h.put("bins", edges);
        h.put("counts", counts);
        return h;
    }

    private Map<String, Object> emptyHistogram() {
        Map<String, Object> h = new HashMap<>();
        h.put("bins", new int[]{0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100});
        h.put("counts", new int[10]);
        return h;
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    @GetMapping("/my-results")
    public List<Map<String, Object>> getMyResults() {
        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new RuntimeException("User not authenticated");
        }
        
        List<StudentExam> studentExams = studentExamRepository.findByKeycloakUserId(currentUserId);
        
        List<Map<String, Object>> results = new ArrayList<>();
        for (StudentExam se : studentExams) {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", se.getId());
            dto.put("status", se.getStatus());
            dto.put("score", se.getScore());
            dto.put("startedAt", se.getStartedAt());
            dto.put("submittedAt", se.getSubmittedAt());
            dto.put("exam", se.getExam());
            
            // Calculate maxScore from answers
            List<Answer> answers = answerRepository.findByStudentExamId(se.getId());
            int maxScore = answers.stream()
                    .mapToInt(a -> a.getQuestion() != null && a.getQuestion().getPoints() != null 
                              ? a.getQuestion().getPoints() : 0)
                    .sum();
            
            dto.put("maxScore", maxScore > 0 ? maxScore : 100);
            results.add(dto);
        }
        
        return results;
        List<StudentExam> list = studentExamRepository.findByKeycloakUserId(currentUserId);
        list.forEach(se -> se.setMaxScore(totalPointsFor(se)));
        return list;
    }

    @PutMapping("/answer/{answerId}/grade")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Answer gradeAnswer(@PathVariable Long answerId, @RequestBody Map<String, Object> gradeData) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new NotFoundException("Answer not found"));

        Integer pointsEarned = ((Number) gradeData.get("pointsEarned")).intValue();
        answer.setPointsEarned(pointsEarned);

        if (gradeData.containsKey("feedback")) {
            Object fb = gradeData.get("feedback");
            answer.setFeedback(fb == null ? null : fb.toString());
        }
        
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

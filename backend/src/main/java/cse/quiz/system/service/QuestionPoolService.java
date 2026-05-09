package cse.quiz.system.service;

import cse.quiz.system.entity.*;
import cse.quiz.system.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionPoolService {
    private final ExamQuestionPoolRepository examQuestionPoolRepository;
    private final StudentExamQuestionRepository studentExamQuestionRepository;
    private final StudentExamRepository studentExamRepository;
    private final ExamRepository examRepository;

    /**
     * Sınava soru havuzu ekle
     */
    @Transactional
    public void addQuestionsToPool(Long examId, List<Long> questionIds) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        // Mevcut havuzu temizle
        examQuestionPoolRepository.deleteByExamId(examId);

        // Yeni soruları ekle
        for (int i = 0; i < questionIds.size(); i++) {
            ExamQuestionPool pool = new ExamQuestionPool();
            pool.setExam(exam);
            pool.setQuestion(new Question());
            pool.getQuestion().setId(questionIds.get(i));
            pool.setDisplayOrder(i);
            examQuestionPoolRepository.save(pool);
        }
    }

    /**
     * Öğrenci için rastgele sorular seç ve ata
     * Seed-based random kullanarak aynı öğrenci her zaman aynı soruları görsün
     */
    @Transactional
    public List<Question> assignRandomQuestions(Long studentExamId) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("StudentExam not found"));

        // Zaten atanmış mı kontrol et
        if (studentExamQuestionRepository.existsByStudentExamId(studentExamId)) {
            return studentExamQuestionRepository.findQuestionsByStudentExamId(studentExamId);
        }

        Exam exam = studentExam.getExam();

        // Soru havuzu modu aktif değilse normal soruları döndür
        if (!Boolean.TRUE.equals(exam.getQuestionPoolEnabled())) {
            return List.of(); // Normal mod, havuz yok
        }

        // Havuzdan soruları al
        List<Question> poolQuestions = examQuestionPoolRepository.findQuestionsByExamId(exam.getId());

        if (poolQuestions.isEmpty()) {
            throw new RuntimeException("Question pool is empty");
        }

        // Seed-based random (aynı öğrenci her zaman aynı soruları görsün)
        long seed = studentExamId + exam.getId();
        Collections.shuffle(poolQuestions, new Random(seed));

        // İlk N soruyu seç
        int questionsPerStudent = exam.getQuestionsPerStudent();
        if (questionsPerStudent > poolQuestions.size()) {
            questionsPerStudent = poolQuestions.size();
        }

        List<Question> selectedQuestions = poolQuestions.stream()
                .limit(questionsPerStudent)
                .collect(Collectors.toList());

        // Veritabanına kaydet
        for (int i = 0; i < selectedQuestions.size(); i++) {
            StudentExamQuestion seq = new StudentExamQuestion();
            seq.setStudentExam(studentExam);
            seq.setQuestion(selectedQuestions.get(i));
            seq.setDisplayOrder(i);
            studentExamQuestionRepository.save(seq);
        }

        return selectedQuestions;
    }

    /**
     * Öğrencinin atanmış sorularını getir
     */
    public List<Question> getAssignedQuestions(Long studentExamId) {
        return studentExamQuestionRepository.findQuestionsByStudentExamId(studentExamId);
    }

    /**
     * Havuzdaki tüm soruları getir (istatistikler için)
     */
    public List<Question> getPoolQuestions(Long examId) {
        return examQuestionPoolRepository.findQuestionsByExamId(examId);
    }
}

package cse.quiz.system.service;

import cse.quiz.system.entity.Answer;
import cse.quiz.system.entity.Question;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.repository.AnswerRepository;
import cse.quiz.system.repository.StudentExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class GradingService {
    private final AnswerRepository answerRepository;
    private final StudentExamRepository studentExamRepository;

    @Transactional
    public void gradeExam(Long studentExamId) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("StudentExam not found"));

        List<Answer> answers = answerRepository.findByStudentExamId(studentExamId);
        
        double totalScore = 0.0;
        
        for (Answer answer : answers) {
            Question question = answer.getQuestion();
            
            // Sadece otomatik puanlanabilir soruları değerlendir
            if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE ||
                question.getType() == Question.QuestionType.TRUE_FALSE) {

                boolean blank = answer.getAnswerText() == null || answer.getAnswerText().isBlank();
                if (blank) {
                    // Boş bırakılan soru: yanlış değil "cevapsız" sayılır (0 puan, isCorrect=null)
                    answer.setIsCorrect(null);
                    answer.setPointsEarned(0);
                } else {
                    boolean isCorrect = checkAnswer(question, answer.getAnswerText());
                    answer.setIsCorrect(isCorrect);
                    if (isCorrect) {
                        answer.setPointsEarned(question.getPoints());
                        totalScore += question.getPoints();
                    } else {
                        answer.setPointsEarned(0);
                    }
                }

                answerRepository.save(answer);
            } else if (question.getType() == Question.QuestionType.SHORT_ANSWER) {
                String studentText = answer.getAnswerText();
                boolean blank = studentText == null || studentText.isBlank();
                if (blank) {
                    // Boş → cevapsız (0 puan), manuel değerlendirmeye düşmez
                    answer.setIsCorrect(null);
                    answer.setPointsEarned(0);
                } else if (norm(studentText).equals(norm(question.getCorrectAnswer()))) {
                    // Büyük/küçük harf ve boşluk duyarsız birebir eşleşme → otomatik doğru
                    answer.setIsCorrect(true);
                    answer.setPointsEarned(question.getPoints());
                    totalScore += question.getPoints();
                } else {
                    // Eşleşmiyor → eğitmen manuel değerlendirsin (henüz puanlanmadı)
                    answer.setIsCorrect(null);
                    answer.setPointsEarned(null);
                }
                answerRepository.save(answer);
            }
        }
        
        studentExam.setScore(totalScore);
        studentExam.setStatus(StudentExam.ExamStatus.GRADED);
        studentExamRepository.save(studentExam);
    }
    
    /**
     * Öğrenci cevabını doğru cevapla esnek biçimde karşılaştırır (önizleme mantığıyla aynı).
     * - TRUE_FALSE: true/doğru/d/1/evet ve false/yanlış/y/0/hayır eşanlamlıları.
     * - MULTIPLE_CHOICE: doğru cevap harf ("C"), harf+ayraç ("C)", "C.") veya şık metni
     *   olabilir; öğrenci genelde harf gönderir. Doğru harf çözülüp karşılaştırılır.
     */
    private boolean checkAnswer(Question question, String studentAnswer) {
        String s = norm(studentAnswer);
        String c = norm(question.getCorrectAnswer());
        if (s.isEmpty() || c.isEmpty()) return false;

        if (question.getType() == Question.QuestionType.TRUE_FALSE) {
            Boolean sb = tfValue(s);
            Boolean cb = tfValue(c);
            return sb != null && sb.equals(cb);
        }

        if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE) {
            String correctLetter = resolveCorrectLetter(question.getCorrectAnswer(), question.getOptions());
            if (correctLetter != null && norm(correctLetter).equals(s)) return true;
            return s.equals(c); // metin birebir eşleşmesi (yedek)
        }

        // Diğer tipler: birebir eşleşme
        return s.equals(c);
    }

    private String norm(String v) {
        return v == null ? "" : v.trim().toLowerCase();
    }

    private static final Set<String> TRUTHY = Set.of("true", "d", "doğru", "1", "evet");
    private static final Set<String> FALSY = Set.of("false", "y", "yanlış", "0", "hayır");

    private Boolean tfValue(String v) {
        if (TRUTHY.contains(v)) return Boolean.TRUE;
        if (FALSY.contains(v)) return Boolean.FALSE;
        return null;
    }

    /** Doğru şık harfini esnek biçimde çıkarır ("C", "C)", "C. ...", veya şık metni). */
    private String resolveCorrectLetter(String correct, String optionsRaw) {
        if (correct == null) return null;
        String trimmed = correct.trim();
        if (trimmed.isEmpty()) return null;
        if (trimmed.length() == 1) return trimmed.toUpperCase();
        String upper = trimmed.toUpperCase();
        if (upper.matches("^[A-ZÇĞİÖŞÜ][).\\-:].*")) return upper.substring(0, 1);

        String n = norm(trimmed);
        List<String[]> opts = parseOptions(optionsRaw); // {letter, text, raw}
        for (String[] o : opts) if (norm(o[1]).equals(n)) return o[0];
        for (String[] o : opts) if (norm(o[2]).equals(n)) return o[0];
        for (String[] o : opts) if (!o[1].isEmpty() && n.contains(norm(o[1]))) return o[0];
        if (upper.matches("^[A-ZÇĞİÖŞÜ].*")) return upper.substring(0, 1);
        return null;
    }

    private List<String[]> parseOptions(String raw) {
        List<String[]> out = new ArrayList<>();
        if (raw == null) return out;
        for (String line : raw.split("\n")) {
            if (line.trim().isEmpty()) continue;
            String letter = line.substring(0, 1).toUpperCase();
            int paren = line.indexOf(')');
            String cleaned = (paren >= 0 ? line.substring(paren + 1) : line.substring(1)).trim();
            out.add(new String[]{ letter, cleaned, line });
        }
        return out;
    }
}

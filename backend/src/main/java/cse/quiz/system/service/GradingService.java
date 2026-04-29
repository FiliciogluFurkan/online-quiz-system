package cse.quiz.system.service;

import cse.quiz.system.entity.Answer;
import cse.quiz.system.entity.Question;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.repository.AnswerRepository;
import cse.quiz.system.repository.StudentExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
                
                boolean isCorrect = checkAnswer(answer.getAnswerText(), question.getCorrectAnswer());
                answer.setIsCorrect(isCorrect);
                
                if (isCorrect) {
                    answer.setPointsEarned(question.getPoints());
                    totalScore += question.getPoints();
                } else {
                    answer.setPointsEarned(0);
                }
                
                answerRepository.save(answer);
            }
            // SHORT_ANSWER için manuel değerlendirme gerekli
        }
        
        studentExam.setScore(totalScore);
        studentExam.setStatus(StudentExam.ExamStatus.GRADED);
        studentExamRepository.save(studentExam);
    }
    
    private boolean checkAnswer(String studentAnswer, String correctAnswer) {
        if (studentAnswer == null || correctAnswer == null) {
            return false;
        }
        
        // Boşlukları temizle ve küçük harfe çevir
        String cleanStudent = studentAnswer.trim().toLowerCase();
        String cleanCorrect = correctAnswer.trim().toLowerCase();
        
        return cleanStudent.equals(cleanCorrect);
    }
}

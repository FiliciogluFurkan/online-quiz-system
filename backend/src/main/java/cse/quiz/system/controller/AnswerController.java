package cse.quiz.system.controller;

import cse.quiz.system.entity.Answer;
import cse.quiz.system.repository.AnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
public class AnswerController {
    private final AnswerRepository answerRepository;

    @GetMapping("/student-exam/{studentExamId}")
    public List<Answer> getAnswers(@PathVariable Long studentExamId) {
        return answerRepository.findByStudentExamId(studentExamId);
    }

    @PostMapping
    public Answer saveAnswer(@RequestBody Answer answer) {
        return answerRepository.save(answer);
    }
}

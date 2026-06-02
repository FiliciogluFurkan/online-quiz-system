package cse.quiz.system.controller;

import cse.quiz.system.entity.Answer;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.exception.NotFoundException;
import cse.quiz.system.exception.UnauthorizedException;
import cse.quiz.system.repository.AnswerRepository;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
public class AnswerController {
    private final AnswerRepository answerRepository;
    private final StudentExamRepository studentExamRepository;

    @GetMapping("/student-exam/{studentExamId}")
    public List<Answer> getAnswers(@PathVariable Long studentExamId) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        if (!SecurityUtils.hasAnyRole("INSTRUCTOR", "ADMIN")) {
            StudentExam studentExam = studentExamRepository.findById(studentExamId)
                    .orElseThrow(() -> new NotFoundException("StudentExam not found"));
            if (currentUserId == null || !currentUserId.equals(studentExam.getKeycloakUserId())) {
                throw new UnauthorizedException("Unauthorized");
            }
        }
        return answerRepository.findByStudentExamId(studentExamId);
    }

    @PostMapping
    public Answer saveAnswer(@RequestBody Answer answer) {
        StudentExam studentExam = studentExamRepository.findById(answer.getStudentExam().getId())
                .orElseThrow(() -> new NotFoundException("StudentExam not found"));

        String currentUserId = SecurityUtils.getCurrentUserId();
        if (!SecurityUtils.hasAnyRole("INSTRUCTOR", "ADMIN")
                && (currentUserId == null || !currentUserId.equals(studentExam.getKeycloakUserId()))) {
            throw new UnauthorizedException("Unauthorized: cannot submit answers for another student");
        }

        return answerRepository.save(answer);
    }
}

package cse.quiz.system.dto;

import cse.quiz.system.entity.Question;

public record QuestionStudentDto(
        Long id,
        Question.QuestionType type,
        String questionText,
        String options,
        Integer points
) {
    public static QuestionStudentDto from(Question q) {
        return new QuestionStudentDto(
                q.getId(), q.getType(), q.getQuestionText(),
                q.getOptions(), q.getPoints()
        );
    }
}

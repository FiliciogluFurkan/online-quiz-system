package cse.quiz.system.dto;

import cse.quiz.system.entity.ExamQuestion;

public record ExamQuestionStudentDto(
        Long id,
        QuestionStudentDto question,
        Integer orderIndex
) {
    public static ExamQuestionStudentDto from(ExamQuestion eq) {
        return new ExamQuestionStudentDto(
                eq.getId(),
                QuestionStudentDto.from(eq.getQuestion()),
                eq.getOrderIndex()
        );
    }
}

package cse.quiz.system.dto;

import java.util.List;

public record AssignmentRequest(String visibility, List<Long> classIds) {
}

package cse.quiz.system.dto;

import java.util.List;

/**
 * Toplu soru işlemleri için istek gövdesi.
 * - bulk-delete: yalnızca {@code questionIds} kullanılır.
 * - bulk-category: {@code questionIds} verilen kategoriye atanır ({@code categoryId} null ise kategorisi kaldırılır).
 */
public record QuestionBulkRequest(List<Long> questionIds, Long categoryId) {
}

package cse.quiz.system.repository;

import cse.quiz.system.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByCategoryId(Long categoryId);
    List<Question> findByKeycloakCreatorId(String keycloakCreatorId);
}

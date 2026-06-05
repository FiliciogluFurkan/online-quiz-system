package cse.quiz.system.config;

import cse.quiz.system.entity.Exam;
import cse.quiz.system.repository.ExamRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class ExamVisibilityBackfill {

    /**
     * visibility kolonu sonradan eklendiği için mevcut satırlarda null kalır.
     * Geri uyumluluk: null görünürlüğü PUBLIC (herkese açık) kabul edip backfill ederiz,
     * böylece eskiden yayınlanmış sınavlar tüm öğrencilere görünür kalır.
     */
    @Bean
    public ApplicationRunner backfillExamVisibility(ExamRepository examRepository) {
        return args -> {
            int updated = 0;
            for (Exam exam : examRepository.findAll()) {
                if (exam.getVisibility() == null) {
                    exam.setVisibility(Exam.Visibility.PUBLIC);
                    examRepository.save(exam);
                    updated++;
                }
            }
            if (updated > 0) {
                log.info("Backfilled visibility=PUBLIC on {} exams", updated);
            }
        };
    }
}

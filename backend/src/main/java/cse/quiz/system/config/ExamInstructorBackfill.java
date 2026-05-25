package cse.quiz.system.config;

import cse.quiz.system.entity.Exam;
import cse.quiz.system.entity.StudentExam;
import cse.quiz.system.repository.ExamRepository;
import cse.quiz.system.repository.StudentExamRepository;
import cse.quiz.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class ExamInstructorBackfill {

    @Bean
    public ApplicationRunner backfillExamInstructor(ExamRepository examRepository,
                                                    StudentExamRepository studentExamRepository,
                                                    UserRepository userRepository) {
        return args -> {
            int examUpdated = 0;
            for (Exam exam : examRepository.findAll()) {
                if (exam.getInstructor() != null) continue;
                String kcId = exam.getKeycloakInstructorId();
                if (kcId == null) continue;
                var user = userRepository.findByKeycloakUserId(kcId);
                if (user.isPresent()) {
                    exam.setInstructor(user.get());
                    examRepository.save(exam);
                    examUpdated++;
                }
            }
            if (examUpdated > 0) {
                log.info("Backfilled instructor on {} exams", examUpdated);
            }

            int seUpdated = 0;
            for (StudentExam se : studentExamRepository.findAll()) {
                if (se.getStudent() != null) continue;
                String kcId = se.getKeycloakUserId();
                if (kcId == null) continue;
                var user = userRepository.findByKeycloakUserId(kcId);
                if (user.isPresent()) {
                    se.setStudent(user.get());
                    studentExamRepository.save(se);
                    seUpdated++;
                }
            }
            if (seUpdated > 0) {
                log.info("Backfilled student on {} student-exams", seUpdated);
            }
        };
    }
}

package cse.quiz.system.config;

import cse.quiz.system.entity.User;
import cse.quiz.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        // Test kullanıcıları oluştur (eğer yoksa)
        if (userRepository.count() == 0) {
            User student = new User();
            student.setEmail("student@test.com");
            student.setFullName("Test Öğrenci");
            student.setRole(User.UserRole.STUDENT);
            student.setActive(true);
            userRepository.save(student);

            User instructor = new User();
            instructor.setEmail("instructor@test.com");
            instructor.setFullName("Test Eğitmen");
            instructor.setRole(User.UserRole.INSTRUCTOR);
            instructor.setActive(true);
            userRepository.save(instructor);

            System.out.println("Test kullanıcıları oluşturuldu!");
        }
    }
}

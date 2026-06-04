package cse.quiz.system.controller;

import cse.quiz.system.exception.ConflictException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Görsel yükler ve sunulabilir bir yol döndürür ({"url": "/uploads/<dosya>"}).
     * Dönen yol kimlik doğrulaması olmadan /uploads/** üzerinden servis edilir.
     */
    @PostMapping("/image")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Map<String, String> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ConflictException("Dosya boş olamaz");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ConflictException("Yalnızca görsel dosyaları yüklenebilir");
        }

        String ext = extensionFor(file.getOriginalFilename(), contentType);
        String filename = UUID.randomUUID().toString().replace("-", "") + ext;

        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new RuntimeException("Görsel kaydedilemedi: " + e.getMessage(), e);
        }

        return Map.of("url", "/uploads/" + filename);
    }

    private String extensionFor(String originalName, String contentType) {
        if (originalName != null && originalName.contains(".")) {
            String ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
            if (ext.matches("\\.(png|jpe?g|gif|webp|bmp|svg)")) return ext;
        }
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            case "image/svg+xml" -> ".svg";
            default -> ".img";
        };
    }
}

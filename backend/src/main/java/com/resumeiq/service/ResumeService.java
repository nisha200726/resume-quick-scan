package com.resumeiq.service;

import com.resumeiq.model.Resume;
import com.resumeiq.model.User;
import com.resumeiq.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    public Resume uploadResume(MultipartFile file, User user) throws IOException {
        Files.createDirectories(Paths.get(UPLOAD_DIR));
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(UPLOAD_DIR, fileName);
        Files.write(filePath, file.getBytes());

        String extractedText = extractText(file, filePath.toFile());

        Resume resume = Resume.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .filePath(filePath.toString())
                .extractedText(extractedText)
                .build();
        return resumeRepository.save(resume);
    }

    public List<Resume> getUserResumes(Long userId) {
        return resumeRepository.findByUserId(userId);
    }

    private String extractText(MultipartFile file, File savedFile) throws IOException {
        String originalName = file.getOriginalFilename();
        if (originalName == null) return "";
        String ext = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();

        try {
            if (ext.equals("pdf")) {
                try (PDDocument doc = Loader.loadPDF(savedFile)) {
                    return new PDFTextStripper().getText(doc);
                }
            }
            if (ext.equals("docx")) {
                try (XWPFDocument doc = new XWPFDocument(Files.newInputStream(savedFile.toPath()))) {
                    return new XWPFWordExtractor(doc).getText();
                }
            }
            if (ext.equals("txt") || ext.equals("md")) {
                return Files.readString(savedFile.toPath());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Best-effort fallback
        return new String(file.getBytes()).replaceAll("[^\\x20-\\x7E\\n\\r]", " ");
    }
}


package com.resumeiq.controller;

import com.resumeiq.dto.ApiResponse;
import com.resumeiq.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin
public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final AnalysisRepository analysisRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        long totalUsers = userRepository.count();
        long activeJobs = jobRepository.count();
        long resumesProcessed = resumeRepository.count();
        long totalAnalyses = analysisRepository.count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeJobs", activeJobs);
        stats.put("resumesProcessed", resumesProcessed);
        stats.put("totalAnalyses", totalAnalyses);

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}


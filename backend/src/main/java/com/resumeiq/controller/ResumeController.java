package com.resumeiq.controller;

import com.resumeiq.dto.ApiResponse;
import com.resumeiq.model.Resume;
import com.resumeiq.model.User;
import com.resumeiq.service.ResumeService;
import com.resumeiq.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@CrossOrigin
public class ResumeController {

    private final ResumeService resumeService;
    private final UserService userService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Resume>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        User user = userService.getCurrentUser(userDetails.getUsername());
        Resume resume = resumeService.uploadResume(file, user);
        return ResponseEntity.ok(ApiResponse.ok("Resume uploaded", resume));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Resume>>> getMyResumes(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(resumeService.getUserResumes(user.getId())));
    }
}


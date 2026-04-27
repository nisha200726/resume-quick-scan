package com.resumeiq.controller;

import com.resumeiq.dto.ApiResponse;
import com.resumeiq.dto.JobRequest;
import com.resumeiq.model.Job;
import com.resumeiq.model.User;
import com.resumeiq.service.JobService;
import com.resumeiq.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin
public class JobController {

    private final JobService jobService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Job>>> getAllJobs() {
        return ResponseEntity.ok(ApiResponse.ok(jobService.getAllJobs()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Job>> createJob(
            @RequestBody JobRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        Job job = jobService.createJob(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Job posted", job));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(ApiResponse.ok("Job deleted", null));
    }
}


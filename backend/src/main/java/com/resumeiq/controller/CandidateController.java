package com.resumeiq.controller;

import com.resumeiq.dto.ApiResponse;
import com.resumeiq.model.Candidate;
import com.resumeiq.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@CrossOrigin
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Candidate>>> getAllCandidates() {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.getAllCandidates()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Candidate>> createCandidate(@RequestBody Candidate candidate) {
        Candidate saved = candidateService.createCandidate(candidate);
        return ResponseEntity.ok(ApiResponse.ok("Candidate created", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.ok(ApiResponse.ok("Candidate deleted", null));
    }
}


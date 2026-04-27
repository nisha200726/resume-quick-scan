package com.resumeiq.controller;

import com.resumeiq.dto.AnalysisRequest;
import com.resumeiq.dto.AnalysisResponse;
import com.resumeiq.dto.ApiResponse;
import com.resumeiq.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analyze")
@RequiredArgsConstructor
@CrossOrigin
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping
    public ResponseEntity<ApiResponse<AnalysisResponse>> analyze(@RequestBody AnalysisRequest request) {
        AnalysisResponse result = analysisService.analyze(request);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}


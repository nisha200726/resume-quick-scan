package com.resumeiq.dto;

import lombok.Data;

@Data
public class AnalysisRequest {
    private String resumeText;
    private String jdText;
    private Long resumeId;
    private Long jobId;
}


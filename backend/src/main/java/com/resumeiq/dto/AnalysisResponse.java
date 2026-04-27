package com.resumeiq.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnalysisResponse {
    private Integer matchPercent;
    private Integer rankScore;
    private Integer keywordOverlap;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<SuggestedSkill> suggestedSkills;
    private List<String> jdSkills;
    private List<String> resumeSkills;
    private List<String> feedback;

    @Data
    @Builder
    public static class SuggestedSkill {
        private String name;
        private String resource;
    }
}


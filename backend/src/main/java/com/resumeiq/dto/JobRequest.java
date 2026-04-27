package com.resumeiq.dto;

import lombok.Data;

@Data
public class JobRequest {
    private String title;
    private String company;
    private String location;
    private String type;
    private String description;
    private String skills;
}


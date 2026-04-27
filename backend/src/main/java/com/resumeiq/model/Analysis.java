package com.resumeiq.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    private Integer matchPercent;

    private Integer rankScore;

    private Integer keywordOverlap;

    @Column(length = 2000)
    private String matchedSkills;

    @Column(length = 2000)
    private String missingSkills;

    @Column(length = 2000)
    private String suggestedSkills;

    @Column(length = 4000)
    private String feedback;

    @CreationTimestamp
    private LocalDateTime createdAt;
}


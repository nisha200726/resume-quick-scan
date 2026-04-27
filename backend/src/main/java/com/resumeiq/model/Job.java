package com.resumeiq.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    private String location;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, length = 5000)
    private String description;

    @Column(length = 2000)
    private String skills;

    @ManyToOne
    @JoinColumn(name = "posted_by")
    private User postedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;
}


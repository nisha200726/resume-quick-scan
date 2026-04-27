package com.resumeiq.service;

import com.resumeiq.dto.JobRequest;
import com.resumeiq.model.Job;
import com.resumeiq.model.User;
import com.resumeiq.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public List<Job> getAllJobs() {
        return jobRepository.findAllByOrderByCreatedAtDesc();
    }

    public Job createJob(JobRequest request, User postedBy) {
        Job job = Job.builder()
                .title(request.getTitle())
                .company(request.getCompany())
                .location(request.getLocation())
                .type(request.getType())
                .description(request.getDescription())
                .skills(request.getSkills())
                .postedBy(postedBy)
                .build();
        return jobRepository.save(job);
    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }

    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }
}


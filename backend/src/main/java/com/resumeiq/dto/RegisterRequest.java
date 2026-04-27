package com.resumeiq.dto;

import com.resumeiq.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String fullName;

    private User.Role role = User.Role.CANDIDATE;
}


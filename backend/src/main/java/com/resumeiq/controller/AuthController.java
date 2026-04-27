package com.resumeiq.controller;

import com.resumeiq.dto.ApiResponse;
import com.resumeiq.dto.LoginRequest;
import com.resumeiq.dto.RegisterRequest;
import com.resumeiq.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> data = userService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registered successfully", data));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> data = userService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", data));
    }
}


package com.draxlmaier.assethub.module.employee.controller;

import com.draxlmaier.assethub.module.employee.dto.RegisterRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.AuthResponseDTO;
import com.draxlmaier.assethub.module.employee.service.AuthService;
import com.draxlmaier.assethub.module.employee.dto.LoginRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
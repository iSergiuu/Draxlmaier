package com.draxlmaier.assethub.module.auth.controller;

import com.draxlmaier.assethub.module.auth.dto.AuthResponseDTO;
import com.draxlmaier.assethub.module.auth.dto.ForgotPasswordRequestDTO;
import com.draxlmaier.assethub.module.auth.dto.ResetPasswordRequestDTO;
import com.draxlmaier.assethub.module.auth.service.AuthService;
import com.draxlmaier.assethub.module.auth.service.PasswordResetService;
import com.draxlmaier.assethub.module.employee.dto.LoginRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.RegisterRequestDTO;
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
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        passwordResetService.processForgotPassword(request.email());
        return ResponseEntity.ok("Dacă adresa de email există în sistem, vei primi un link pentru resetarea parolei.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok("Parola a fost resetată cu succes. Te poți autentifica folosind noua parolă.");
    }
}
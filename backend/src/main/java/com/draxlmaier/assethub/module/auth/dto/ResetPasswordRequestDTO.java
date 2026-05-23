package com.draxlmaier.assethub.module.auth.dto;

public record ResetPasswordRequestDTO(
        String token,
        String newPassword,
        String confirmPassword
) {}
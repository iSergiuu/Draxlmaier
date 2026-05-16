package com.draxlmaier.assethub.module.employee.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank(message = "Email-ul este obligatoriu")
        String email,

        @NotBlank(message = "Parola este obligatorie")
        String password
) {}
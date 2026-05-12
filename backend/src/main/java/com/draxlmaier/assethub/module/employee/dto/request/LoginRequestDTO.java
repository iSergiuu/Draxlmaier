package com.draxlmaier.assethub.module.employee.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDTO {
    @NotBlank(message = "Email-ul este obligatoriu")
    private String email;

    @NotBlank(message = "Parola este obligatorie")
    private String password;
}
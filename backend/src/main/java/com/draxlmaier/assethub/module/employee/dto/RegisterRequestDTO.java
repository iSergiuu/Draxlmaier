package com.draxlmaier.assethub.module.employee.dto;

import jakarta.validation.constraints.*;

public record RegisterRequestDTO(
        @NotBlank(message = "Prenumele este obligatoriu")
        String firstName,

        @NotBlank(message = "Numele este obligatoriu")
        String lastName,

        @Email(message = "Email-ul nu este valid")
        @NotBlank(message = "Email-ul este obligatoriu")
        String email,

        @NotBlank(message = "Parola este obligatorie")
        @Size(min = 8, max = 20, message = "Parola trebuie să aibă între 8 și 20 de caractere")
        @Pattern(
                regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$",
                message = "Parola trebuie să conțină cel puțin o cifră, o literă mică, o literă mare și un caracter special (@#$%^&+=!)"
        )
        String password,

        @NotBlank(message = "Numărul de angajat este obligatoriu")
        String employeeNumber
) {}
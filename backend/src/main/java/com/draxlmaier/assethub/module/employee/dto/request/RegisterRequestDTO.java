package com.draxlmaier.assethub.module.employee.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequestDTO {
    private String firstName;
    private String lastName;
    private String email;

    @NotBlank(message = "Parola este obligatorie")
    @Size(min = 8, max = 20, message = "Parola trebuie sa aiba intre 8 si 20 de caractere")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$",
            message = "Parola trebuie să conțină cel puțin o cifră, o literă mică, o literă mare și un caracter special (@#$%^&+=!)"
    )
    private String password;

    @NotBlank(message = "Codul de securitate este obligatoriu!")
    private String securityNumber;
}
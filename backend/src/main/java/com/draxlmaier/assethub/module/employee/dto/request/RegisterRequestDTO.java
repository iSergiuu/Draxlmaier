package com.draxlmaier.assethub.module.employee.dto.request;

import lombok.Data;

@Data
public class RegisterRequestDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String securityNumber;
}
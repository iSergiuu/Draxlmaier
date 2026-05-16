package com.draxlmaier.assethub.module.department.dto;

import jakarta.validation.constraints.NotBlank;

public record DepartmentRequestDTO (
        @NotBlank(message = "Numele departamentului este obligatoriu")
        String name;
) {}

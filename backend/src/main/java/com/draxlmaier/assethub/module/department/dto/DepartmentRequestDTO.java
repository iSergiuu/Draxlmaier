package com.draxlmaier.assethub.module.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record DepartmentRequestDTO (
        @NotBlank(message = "Numele departamentului este obligatoriu")
        String name,

        @NotNull(message = "Managerul departamentului este obligatoriu")
        UUID managerId
) {}
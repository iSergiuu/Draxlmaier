package com.draxlmaier.assethub.module.employee.dto;

import jakarta.validation.constraints.NotBlank;

public record RoleChangeRequestDTO(
        @NotBlank(message = "Codul rolului este obligatoriu (ex: ADMIN, DEPT_RESPONSIBLE, SUPER_ADMIN)")
        String roleCode
) {}
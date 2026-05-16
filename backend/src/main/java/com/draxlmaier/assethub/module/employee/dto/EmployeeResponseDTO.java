package com.draxlmaier.assethub.module.employee.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EmployeeResponseDTO(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String employeeNumber,
        String departmentName,
        String roleCode,
        boolean isActive,
        OffsetDateTime createdAt
) {}
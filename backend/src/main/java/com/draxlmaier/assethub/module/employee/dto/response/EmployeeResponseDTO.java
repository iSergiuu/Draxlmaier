package com.draxlmaier.assethub.module.employee.dto.response;

import java.time.OffsetDateTime;

public record EmployeeResponseDTO(
        String firstName,
        String lastName,
        String email,
        String employeeNumber,
        String departmentName,
        String roleCode,
        OffsetDateTime createdAt,
        long totalTickets
) {}
package com.draxlmaier.assethub.module.employee.dto;

import java.util.UUID;

public record EmployeeRequestDTO(
        String roleCode,
        UUID departmentId
) {}
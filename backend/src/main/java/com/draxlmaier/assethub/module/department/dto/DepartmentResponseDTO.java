package com.draxlmaier.assethub.module.department.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record DepartmentResponseDTO (
        UUID id,
        String name,
        OffsetDateTime createdAt
) {}

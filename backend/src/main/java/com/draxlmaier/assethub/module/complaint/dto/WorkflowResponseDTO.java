package com.draxlmaier.assethub.module.complaint.dto;

import lombok.Builder;
import java.time.OffsetDateTime;

@Builder
public record WorkflowResponseDTO(
        String changedBy,
        String oldStatus,
        String newStatus,
        String comment,
        OffsetDateTime createdAt
) {}
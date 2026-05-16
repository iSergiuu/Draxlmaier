package com.draxlmaier.assethub.module.complaint.dto;

import lombok.Builder;
import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record ComplaintResponseDTO(
        UUID id,
        Integer ticketNumber,
        String title,
        String description,
        String priority,
        UUID assetId,
        String assetName,
        String authorName,
        String statusId,
        String statusCode,
        OffsetDateTime createdAt,
        OffsetDateTime resolvedAt
) {}
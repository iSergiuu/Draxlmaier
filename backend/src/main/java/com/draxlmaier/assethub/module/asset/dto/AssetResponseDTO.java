package com.draxlmaier.assethub.module.asset.dto;

import lombok.Builder;
import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record AssetResponseDTO(
        UUID id,
        String name,
        String serialNumber,
        String category,
        UUID assignedToId,
        String assignedToName,
        String assignedToEmail,
        String status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
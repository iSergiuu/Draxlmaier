package com.draxlmaier.assethub.module.asset.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetResponseDTO {
    private UUID id;
    private String name;
    private String serialNumber;
    private String category;

    private UUID assignedToId;
    private String assignedToName;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

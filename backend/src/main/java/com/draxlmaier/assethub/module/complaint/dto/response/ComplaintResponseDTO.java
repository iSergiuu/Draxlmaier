package com.draxlmaier.assethub.module.complaint.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponseDTO {
    private UUID id;
    private Integer ticketNumber;
    private String title;
    private String description;
    private String priority;

    private UUID assetId;
    private String assetName;

    private String authorName;

    private String statusId;
    private String statusCode;

    private OffsetDateTime createdAt;
    private OffsetDateTime resolvedAt;
}
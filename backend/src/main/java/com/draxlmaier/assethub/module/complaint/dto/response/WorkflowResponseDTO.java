package com.draxlmaier.assethub.module.complaint.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowResponseDTO {
    private String changedBy;
    private String oldStatus;
    private String newStatus;
    private String comment;
    private OffsetDateTime createdAt;
}
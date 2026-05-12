package com.draxlmaier.assethub.module.complaint.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class WorkflowResponseDTO {
    private String changedBy;
    private String oldStatus;
    private String newStatus;
    private String comment;
    private OffsetDateTime createdAt;
}
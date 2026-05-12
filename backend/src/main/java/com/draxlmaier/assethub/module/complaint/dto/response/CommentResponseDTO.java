package com.draxlmaier.assethub.module.complaint.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class CommentResponseDTO {
    private UUID id;
    private String message;
    private String authorName;
    private boolean isInternal;
    private OffsetDateTime createdAt;
}
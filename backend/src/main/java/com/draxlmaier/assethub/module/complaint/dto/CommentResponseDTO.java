package com.draxlmaier.assethub.module.complaint.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record CommentResponseDTO(
        UUID id,
        String message,
        String authorName,

        @JsonProperty("isInternal")
        boolean isInternal,

        OffsetDateTime createdAt
) {}
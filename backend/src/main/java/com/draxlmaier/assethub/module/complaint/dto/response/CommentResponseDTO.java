package com.draxlmaier.assethub.module.complaint.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class CommentResponseDTO {
    private UUID id;
    private String message;
    private String authorName;

    @JsonProperty("isInternal") 
    private boolean isInternal;

    private OffsetDateTime createdAt;
}
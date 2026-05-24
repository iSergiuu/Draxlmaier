package com.draxlmaier.assethub.module.complaint.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record FeedbackResponseDTO(
        UUID id,
        UUID complaintId,
        Integer rating,
        String comment,
        OffsetDateTime createdAt
) {}
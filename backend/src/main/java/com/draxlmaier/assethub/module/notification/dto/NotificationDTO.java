package com.draxlmaier.assethub.module.notification.dto;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class NotificationDTO {
    private UUID id;
    private String title;
    private String message;
    private boolean read;
    private UUID referenceId;
    private OffsetDateTime createdAt;
}
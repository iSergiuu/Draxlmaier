package com.draxlmaier.assethub.module.complaint.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class StatusChangeRequestDTO {
    @NotNull
    private UUID newStatusId;

    private String comment;
}
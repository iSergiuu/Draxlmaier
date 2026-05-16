package com.draxlmaier.assethub.module.complaint.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record StatusChangeRequestDTO(
        @NotNull(message = "Noul status este obligatoriu")
        UUID newStatusId,

        String comment
) {}
package com.draxlmaier.assethub.module.complaint.dto;

import jakarta.validation.constraints.NotNull;

public record StatusChangeRequestDTO(
        @NotNull(message = "Noul status este obligatoriu")
        String newStatusId,

        String comment
) {}
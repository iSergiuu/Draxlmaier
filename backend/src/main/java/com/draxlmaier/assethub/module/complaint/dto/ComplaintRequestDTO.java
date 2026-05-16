package com.draxlmaier.assethub.module.complaint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ComplaintRequestDTO(
        @NotBlank(message = "Titlul este obligatoriu")
        String title,

        @NotBlank(message = "Descrierea este obligatorie")
        String description,

        @NotNull(message = "Asset-ul este obligatoriu")
        UUID assetId,

        String priority // LOW, MEDIUM, HIGH, CRITICAL
) {}
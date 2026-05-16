package com.draxlmaier.assethub.module.asset.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record AssetRequestDTO(
        @NotBlank(message = "Numele echipamentului este obligatoriu")
        String name,

        @NotBlank(message = "Numărul de serie este obligatoriu")
        String serialNumber,

        @NotBlank(message = "Categoria este obligatorie")
        String category,

        String assignedToEmail
) {}
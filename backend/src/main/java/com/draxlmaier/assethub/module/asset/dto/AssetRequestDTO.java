package com.draxlmaier.assethub.module.asset.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record AssetRequestDTO(
        @NotBlank(message = "Numele echipamentului este obligatoriu")
        String name,

        @NotBlank(message = "Numărul de serie este obligatoriu")
        String serialNumber,

        @NotBlank(message = "Categoria este obligatorie")
        String category,

        String assignedToEmail,

        String status
) {}
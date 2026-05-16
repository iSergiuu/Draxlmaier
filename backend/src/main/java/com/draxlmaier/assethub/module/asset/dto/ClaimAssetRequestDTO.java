package com.draxlmaier.assethub.module.asset.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ClaimAssetRequestDTO(
        @NotNull(message = "ID-ul angajatului este obligatoriu")
        UUID employeeId
) {}
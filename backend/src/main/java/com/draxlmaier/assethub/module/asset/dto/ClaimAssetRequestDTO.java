package com.draxlmaier.assethub.module.asset.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ClaimAssetRequestDTO(
        @NotNull(message = "ID-ul angajatului este obligatoriu")
        UUID employeeId
) {}
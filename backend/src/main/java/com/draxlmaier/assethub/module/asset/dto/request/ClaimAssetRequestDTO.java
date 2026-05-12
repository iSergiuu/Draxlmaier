package com.draxlmaier.assethub.module.asset.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimAssetRequestDTO {

    @NotNull(message = "ID-ul angajatului este obligatoriu")
    private UUID employeeId;
}
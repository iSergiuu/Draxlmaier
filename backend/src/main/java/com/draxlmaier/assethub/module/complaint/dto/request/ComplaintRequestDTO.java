package com.draxlmaier.assethub.module.complaint.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintRequestDTO {

    @NotBlank(message = "Titlul este obligatoriu")
    private String title;

    @NotBlank(message = "Descrierea este obligatorie")
    private String description;

    @NotNull(message = "Asset-ul este obligatoriu")
    private UUID assetId;

    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
}
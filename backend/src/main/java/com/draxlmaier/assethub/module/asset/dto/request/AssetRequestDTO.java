package com.draxlmaier.assethub.module.asset.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetRequestDTO {

    @NotBlank(message = "Numele este obligatoriu")
    private String name;

    @NotBlank(message = "Numărul serial este obligatoriu")
    private String serialNumber;

    @NotBlank(message = "Categoria este obligatorie")
    private String category;

    private UUID assignedToId;

    private String assignedToEmail;
}
package com.draxlmaier.assethub.module.asset.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetRequestDTO {

    @NotBlank(message = "Numele echipamentului este obligatoriu")
    private String name;

    @NotBlank(message = "Numărul de serie este obligatoriu")
    private String serialNumber;

    @NotBlank(message = "Categoria este obligatorie")
    private String category;

    // Acesta este câmpul opțional din modal pentru atribuire rapidă
    private String assignedToEmail;
}
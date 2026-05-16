package com.draxlmaier.assethub.module.asset.mapper;

import com.draxlmaier.assethub.module.asset.dto.AssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.AssetResponseDTO;
import com.draxlmaier.assethub.module.asset.model.Asset;
import org.springframework.stereotype.Component;

@Component
public class AssetMapper {

    public AssetResponseDTO toResponseDTO(Asset asset) {
        if (asset == null) return null;

        return AssetResponseDTO.builder()
                .id(asset.getId())
                .name(asset.getName())
                .serialNumber(asset.getSerialNumber())
                .category(asset.getCategory())
                .assignedToId(asset.getAssignedTo() != null ? asset.getAssignedTo().getId() : null)
                .assignedToName(asset.getAssignedTo() != null ?
                        asset.getAssignedTo().getFirstName() + " " + asset.getAssignedTo().getLastName() : "Neatribuit")
                .assignedToEmail(asset.getAssignedTo() != null ? asset.getAssignedTo().getEmail() : "Neatribuit") // Setăm email-ul aici
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt())
                .build();
    }

    public Asset toEntity(AssetRequestDTO dto) {
        if (dto == null) return null;

        return Asset.builder()
                .name(dto.name())
                .serialNumber(dto.serialNumber())
                .category(dto.category())
                .build();
    }
}
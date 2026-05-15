package com.draxlmaier.assethub.module.asset.mapper;

import com.draxlmaier.assethub.module.asset.dto.request.AssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.response.AssetResponseDTO;
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
                .assignedToName(asset.getAssignedTo() != null ?
                        asset.getAssignedTo().getFirstName() + " " + asset.getAssignedTo().getLastName() : "Neatribuit")
                .createdAt(asset.getCreatedAt())
                .build();
    }

    public Asset toEntity(AssetRequestDTO dto) {
        if (dto == null) return null;

        return Asset.builder()
                .name(dto.getName())
                .serialNumber(dto.getSerialNumber())
                .category(dto.getCategory())
                .build();
    }
}
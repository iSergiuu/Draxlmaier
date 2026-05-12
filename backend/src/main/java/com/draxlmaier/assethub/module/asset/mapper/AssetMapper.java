package com.draxlmaier.assethub.module.asset.mapper;

import com.draxlmaier.assethub.module.asset.dto.request.AssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.response.AssetResponseDTO;
import com.draxlmaier.assethub.module.asset.model.Asset;
import org.springframework.stereotype.Component;

@Component
public class AssetMapper {
    public Asset toEntity(AssetRequestDTO requestDTO){
        if (requestDTO == null){
            return null;
        }

        return Asset.builder()
                .name(requestDTO.getName())
                .serialNumber(requestDTO.getSerialNumber())
                .category(requestDTO.getCategory())
                .build();
    }

    public AssetResponseDTO toResponseDTO(Asset asset){
        if (asset == null){
            return null;
        }

        AssetResponseDTO.AssetResponseDTOBuilder builder = AssetResponseDTO.builder()
                .id(asset.getId())
                .name(asset.getName())
                .serialNumber(asset.getSerialNumber())
                .category(asset.getCategory())
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt());

        if (asset.getAssignedTo() != null){
            builder.assignedToId(asset.getAssignedTo().getId());

            builder.assignedToName(asset.getAssignedTo().getFirstName() + " " + asset.getAssignedTo().getLastName());
        }

        return builder.build();
    }
}

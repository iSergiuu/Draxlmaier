package com.draxlmaier.assethub.module.asset.service;

import com.draxlmaier.assethub.module.asset.dto.AssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.ClaimAssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.AssetResponseDTO;

import java.util.List;
import java.util.UUID;

public interface AssetService {
    AssetResponseDTO createAsset(AssetRequestDTO requestDTO);
    List<AssetResponseDTO> getAllAssets();
    AssetResponseDTO getAssetById(UUID id);
    AssetResponseDTO updateAsset(UUID id, AssetRequestDTO requestDTO);
    void deleteAsset(UUID id);
    AssetResponseDTO assignAsset(UUID assetId, ClaimAssetRequestDTO requestDTO);
    List<AssetResponseDTO> getMyAssets();
}
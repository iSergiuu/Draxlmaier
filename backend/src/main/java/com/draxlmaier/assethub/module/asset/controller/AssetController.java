package com.draxlmaier.assethub.module.asset.controller;

import com.draxlmaier.assethub.module.asset.dto.request.AssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.request.ClaimAssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.response.AssetResponseDTO;
import com.draxlmaier.assethub.module.asset.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    // POST /api/assets - Crearea unui asset nou
    @PostMapping
    public ResponseEntity<AssetResponseDTO> createAsset(@Valid @RequestBody AssetRequestDTO requestDTO) {
        AssetResponseDTO response = assetService.createAsset(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/assets - Returnează lista cu toate asset-urile
    @GetMapping
    public ResponseEntity<List<AssetResponseDTO>> getAllAssets() {
        List<AssetResponseDTO> response = assetService.getAllAssets();
        return ResponseEntity.ok(response);
    }

    // GET /api/assets/{id} - Returnează un singur asset după ID
    @GetMapping("/{id}")
    public ResponseEntity<AssetResponseDTO> getAssetById(@PathVariable UUID id) {
        AssetResponseDTO response = assetService.getAssetById(id);
        return ResponseEntity.ok(response);
    }

    // PUT /api/assets/{id} - Actualizează detaliile unui asset
    @PutMapping("/{id}")
    public ResponseEntity<AssetResponseDTO> updateAsset(@PathVariable UUID id, @Valid @RequestBody AssetRequestDTO requestDTO) {
        AssetResponseDTO response = assetService.updateAsset(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    // DELETE /api/assets/{id} - Șterge un asset din baza de date
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable UUID id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/assets/{id}/assign - Alocă un asset unui angajat
    @PostMapping("/{id}/assign")
    public ResponseEntity<AssetResponseDTO> assignAsset(
            @PathVariable UUID id,
            @Valid @RequestBody ClaimAssetRequestDTO requestDTO) {
        AssetResponseDTO response = assetService.assignAsset(id, requestDTO);
        return ResponseEntity.ok(response);
    }
}
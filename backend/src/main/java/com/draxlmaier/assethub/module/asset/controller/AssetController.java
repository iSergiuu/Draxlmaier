package com.draxlmaier.assethub.module.asset.controller;

import com.draxlmaier.assethub.module.asset.dto.request.AssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.request.ClaimAssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.response.AssetResponseDTO;
import com.draxlmaier.assethub.module.asset.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    // Doar Admin și Responsabilul de Departament pot crea asset-uri noi
    @PostMapping
    public ResponseEntity<AssetResponseDTO> createAsset(@Valid @RequestBody AssetRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createAsset(requestDTO));
    }

    // Oricine este autentificat (USER, DEPT_RESPONSIBLE, ADMIN) poate vedea lista de asset-uri
    @GetMapping
    public ResponseEntity<List<AssetResponseDTO>> getAllAssets() {
        List<AssetResponseDTO> response = assetService.getAllAssets();
        return ResponseEntity.ok(response);
    }


    // Oricine este autentificat poate vedea detaliile unui asset
    @GetMapping("/{id}")
    public ResponseEntity<AssetResponseDTO> getAssetById(@PathVariable UUID id) {
        AssetResponseDTO response = assetService.getAssetById(id);
        return ResponseEntity.ok(response);
    }

    // Doar Admin și Responsabilul de Departament pot edita un asset
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'DEPT_RESPONSIBLE', 'ROLE_DEPT_RESPONSIBLE')")
    public ResponseEntity<AssetResponseDTO> updateAsset(@PathVariable UUID id, @Valid @RequestBody AssetRequestDTO requestDTO) {
        AssetResponseDTO response = assetService.updateAsset(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    // Doar Admin poate șterge definitiv un asset din sistem
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Void> deleteAsset(@PathVariable UUID id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    // Doar Admin și Responsabilul de Departament pot aloca echipamente angajaților
    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'DEPT_RESPONSIBLE', 'ROLE_DEPT_RESPONSIBLE')")
    public ResponseEntity<AssetResponseDTO> assignAsset(
            @PathVariable UUID id,
            @Valid @RequestBody ClaimAssetRequestDTO requestDTO) {
        AssetResponseDTO response = assetService.assignAsset(id, requestDTO);
        return ResponseEntity.ok(response);
    }
}
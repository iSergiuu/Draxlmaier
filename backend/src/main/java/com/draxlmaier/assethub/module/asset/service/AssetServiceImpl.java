package com.draxlmaier.assethub.module.asset.service;

import com.draxlmaier.assethub.module.asset.dto.request.AssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.request.ClaimAssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.response.AssetResponseDTO;
import com.draxlmaier.assethub.module.asset.mapper.AssetMapper;
import com.draxlmaier.assethub.module.asset.model.Asset;
import com.draxlmaier.assethub.module.asset.repository.AssetRepository;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final AssetMapper assetMapper;

    @Override
    public List<AssetResponseDTO> getAllAssets() {
        return assetRepository.findAll().stream()
                .map(assetMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AssetResponseDTO getAssetById(UUID id) {
        return assetRepository.findById(id)
                .map(assetMapper::toResponseDTO)
                .orElseThrow(() -> new RuntimeException("Asset-ul nu a fost găsit"));
    }

    @Override
    @Transactional
    public AssetResponseDTO updateAsset(UUID id, AssetRequestDTO requestDTO) {
        // 1. Căutăm echipamentul existent
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Echipamentul nu a fost găsit"));

        // 2. Actualizăm câmpurile de bază
        asset.setName(requestDTO.getName());
        asset.setSerialNumber(requestDTO.getSerialNumber());
        asset.setCategory(requestDTO.getCategory());
        asset.setUpdatedAt(OffsetDateTime.now());

        // 3. Dacă s-a trimis un email pentru alocare, actualizăm și posesorul
        if (requestDTO.getAssignedToEmail() != null && !requestDTO.getAssignedToEmail().isBlank()) {
            Employee employee = employeeRepository.findByEmail(requestDTO.getAssignedToEmail())
                    .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));
            asset.setAssignedTo(employee);
        } else {
            asset.setAssignedTo(null); // Dacă email-ul e gol, scoatem alocarea
        }

        // 4. Salvăm și returnăm rezultatul
        Asset savedAsset = assetRepository.save(asset);
        return assetMapper.toResponseDTO(savedAsset);
    }

    @Override
    public void deleteAsset(UUID id) {

    }

    @Override
    @Transactional
    public AssetResponseDTO createAsset(AssetRequestDTO requestDTO) {
        assetRepository.findBySerialNumber(requestDTO.getSerialNumber())
                .ifPresent(a -> {
                    throw new RuntimeException("Echipamentul cu această serie există deja!");
                });

        Asset asset = assetMapper.toEntity(requestDTO);
        asset.setCreatedAt(OffsetDateTime.now());

        if (requestDTO.getAssignedToEmail() != null && !requestDTO.getAssignedToEmail().isBlank()) {
            Employee employee = employeeRepository.findByEmail(requestDTO.getAssignedToEmail())
                    .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));
            asset.setAssignedTo(employee);
        }

        return assetMapper.toResponseDTO(assetRepository.save(asset));
    }

    // ACEASTA ESTE METODA CARE LIPSEA:
    @Override
    @Transactional
    public AssetResponseDTO assignAsset(UUID assetId, ClaimAssetRequestDTO requestDTO) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Echipamentul nu a fost găsit"));

        Employee employee = employeeRepository.findById(requestDTO.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Angajatul nu a fost găsit"));

        asset.setAssignedTo(employee);
        asset.setUpdatedAt(OffsetDateTime.now());

        return assetMapper.toResponseDTO(assetRepository.save(asset));
    }
}
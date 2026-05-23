package com.draxlmaier.assethub.module.asset.service;

import com.draxlmaier.assethub.module.asset.dto.AssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.ClaimAssetRequestDTO;
import com.draxlmaier.assethub.module.asset.dto.AssetResponseDTO;
import com.draxlmaier.assethub.module.asset.mapper.AssetMapper;
import com.draxlmaier.assethub.module.asset.model.Asset;
import com.draxlmaier.assethub.module.asset.repository.AssetRepository;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
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
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Echipamentul nu a fost găsit"));

        asset.setName(requestDTO.name());
        asset.setSerialNumber(requestDTO.serialNumber());
        asset.setCategory(requestDTO.category());
        asset.setUpdatedAt(OffsetDateTime.now());

        if (requestDTO.assignedToEmail() != null && !requestDTO.assignedToEmail().isBlank()) {
            Employee employee = employeeRepository.findByEmail(requestDTO.assignedToEmail())
                    .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));
            asset.setAssignedTo(employee);
        } else {
            asset.setAssignedTo(null);
        }

        Asset savedAsset = assetRepository.save(asset);
        return assetMapper.toResponseDTO(savedAsset);
    }

    @Override
    public void deleteAsset(UUID id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new com.draxlmaier.assethub.core.exceptions.ResourceNotFoundException("Echipamentul nu a fost găsit pentru ștergere"));

        assetRepository.delete(asset);
    }

    @Override
    @Transactional
    public AssetResponseDTO createAsset(AssetRequestDTO requestDTO) {
        assetRepository.findBySerialNumber(requestDTO.serialNumber())
                .ifPresent(a -> {
                    throw new RuntimeException("Echipamentul cu această serie există deja!");
                });

        Asset asset = assetMapper.toEntity(requestDTO);
        asset.setCreatedAt(OffsetDateTime.now());

        if (requestDTO.assignedToEmail() != null && !requestDTO.assignedToEmail().isBlank()) {
            Employee employee = employeeRepository.findByEmail(requestDTO.assignedToEmail())
                    .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));
            asset.setAssignedTo(employee);
        }

        return assetMapper.toResponseDTO(assetRepository.save(asset));
    }

    @Override
    @Transactional
    public AssetResponseDTO assignAsset(UUID assetId, ClaimAssetRequestDTO requestDTO) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Echipamentul nu a fost găsit"));

        Employee employee = employeeRepository.findById(requestDTO.employeeId())
                .orElseThrow(() -> new RuntimeException("Angajatul nu a fost găsit"));

        asset.setAssignedTo(employee);
        asset.setUpdatedAt(OffsetDateTime.now());

        return assetMapper.toResponseDTO(assetRepository.save(asset));
    }

    @Override
    public List<AssetResponseDTO> getMyAssets(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return assetRepository.findAllByAssignedToEmail(email).stream()
                .map(assetMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
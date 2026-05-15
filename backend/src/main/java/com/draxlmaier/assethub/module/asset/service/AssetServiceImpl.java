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
    @Transactional
    public AssetResponseDTO createAsset(AssetRequestDTO requestDTO) {
        Asset asset = assetMapper.toEntity(requestDTO);
        asset.setCreatedAt(OffsetDateTime.now());

        if (requestDTO.getAssignedToId() != null) {
            Employee employee = employeeRepository.findById(requestDTO.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Angajatul nu a fost găsit după ID!"));
            asset.setAssignedTo(employee);
        }
        else if (requestDTO.getAssignedToEmail() != null && !requestDTO.getAssignedToEmail().trim().isEmpty()) {
            Employee employee = employeeRepository.findByEmail(requestDTO.getAssignedToEmail())
                    .orElseThrow(() -> new RuntimeException("Angajatul cu email-ul " + requestDTO.getAssignedToEmail() + " nu a fost găsit!"));
            asset.setAssignedTo(employee);
        }

        Asset savedAsset = assetRepository.save(asset);
        return assetMapper.toResponseDTO(savedAsset);
    }

    @Override
    public List<AssetResponseDTO> getAllAssets() {
        return assetRepository.findAll().stream()
                .map(assetMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AssetResponseDTO getAssetById(UUID id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset-ul nu a fost găsit!"));
        return assetMapper.toResponseDTO(asset);
    }

    @Override
    @Transactional
    public AssetResponseDTO updateAsset(UUID id, AssetRequestDTO requestDTO) {
        Asset existingAsset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset-ul nu a fost găsit!"));

        existingAsset.setName(requestDTO.getName());
        existingAsset.setSerialNumber(requestDTO.getSerialNumber());
        existingAsset.setCategory(requestDTO.getCategory());
        existingAsset.setUpdatedAt(OffsetDateTime.now());

        if (requestDTO.getAssignedToId() != null) {
            Employee employee = employeeRepository.findById(requestDTO.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Angajatul nu a fost găsit după ID!"));
            existingAsset.setAssignedTo(employee);
        }
        else if (requestDTO.getAssignedToEmail() != null && !requestDTO.getAssignedToEmail().trim().isEmpty()) {
            Employee employee = employeeRepository.findByEmail(requestDTO.getAssignedToEmail())
                    .orElseThrow(() -> new RuntimeException("Angajatul cu email-ul " + requestDTO.getAssignedToEmail() + " nu a fost găsit!"));
            existingAsset.setAssignedTo(employee);
        }
        else {
            existingAsset.setAssignedTo(null);
        }

        Asset updatedAsset = assetRepository.save(existingAsset);
        return assetMapper.toResponseDTO(updatedAsset);
    }

    @Override
    @Transactional
    public void deleteAsset(UUID id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset-ul nu a fost găsit!"));
        assetRepository.delete(asset);
    }

    @Override
    @Transactional
    public AssetResponseDTO assignAsset(UUID assetId, ClaimAssetRequestDTO requestDTO) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset-ul nu a fost găsit!"));

        Employee employee = employeeRepository.findById(requestDTO.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Angajatul nu a fost găsit!"));

        asset.setAssignedTo(employee);
        asset.setUpdatedAt(OffsetDateTime.now());

        Asset savedAsset = assetRepository.save(asset);
        return assetMapper.toResponseDTO(savedAsset);
    }
}
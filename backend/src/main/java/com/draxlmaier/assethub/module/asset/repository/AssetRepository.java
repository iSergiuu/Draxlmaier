package com.draxlmaier.assethub.module.asset.repository;

import com.draxlmaier.assethub.module.asset.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {
    Optional<Asset> findBySerialNumber(String serialNumber);
}
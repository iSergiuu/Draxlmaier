package com.draxlmaier.assethub.module.asset.repository;

import com.draxlmaier.assethub.module.asset.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Integer> {
    Optional<Asset> findBySerialNumber(String serialNumber);
}
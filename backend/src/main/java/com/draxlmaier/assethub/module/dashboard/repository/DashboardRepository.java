package com.draxlmaier.assethub.module.dashboard.repository;

import com.draxlmaier.assethub.module.dashboard.model.DashboardStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardRepository extends JpaRepository<DashboardStat, Long> {
}
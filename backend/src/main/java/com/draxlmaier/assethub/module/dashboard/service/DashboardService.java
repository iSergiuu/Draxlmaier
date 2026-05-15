package com.draxlmaier.assethub.module.dashboard.service;

import com.draxlmaier.assethub.module.dashboard.dto.DashboardStatsDTO;
import com.draxlmaier.assethub.module.dashboard.model.DashboardStat;
import com.draxlmaier.assethub.module.dashboard.repository.DashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardStatsDTO getStats() {
        // Aducem singurul rând generat de View-ul din baza de date
        DashboardStat stats = dashboardRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Nu s-au putut prelua statisticile din baza de date!"));

        DashboardStatsDTO.AssetStatsDTO assetStats = DashboardStatsDTO.AssetStatsDTO.builder()
                .total(stats.getTotalAssets())
                .allocated(stats.getAllocatedAssets())
                .available(stats.getAvailableAssets())
                .broken(stats.getBrokenAssets())
                .deleted(stats.getDeletedAssets())
                .build();

        DashboardStatsDTO.TicketStatsDTO ticketStats = DashboardStatsDTO.TicketStatsDTO.builder()
                .total(stats.getTotalTickets())
                .newTickets(stats.getNewTickets())
                .inProgress(stats.getInProgressTickets())
                .resolved(stats.getResolvedTickets())
                .deleted(stats.getDeletedTickets())
                .build();

        return DashboardStatsDTO.builder()
                .assets(assetStats)
                .tickets(ticketStats)
                .build();
    }
}
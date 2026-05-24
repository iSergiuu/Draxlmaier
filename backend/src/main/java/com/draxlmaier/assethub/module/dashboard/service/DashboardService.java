package com.draxlmaier.assethub.module.dashboard.service;

import com.draxlmaier.assethub.module.asset.repository.AssetRepository;
import com.draxlmaier.assethub.module.dashboard.dto.DashboardStatsDTO;
import com.draxlmaier.assethub.module.dashboard.model.DashboardStat;
import com.draxlmaier.assethub.module.dashboard.repository.DashboardRepository;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardRepository dashboardRepository;
    private final EmployeeRepository employeeRepository;
    private final AssetRepository assetRepository;

    public DashboardStatsDTO getStats() {
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

        List<DashboardStatsDTO.DepartmentStatDTO> employeesPerDept = employeeRepository.findAll().stream()
                .filter(employee -> employee.getDepartment() != null)
                .collect(Collectors.groupingBy(
                        employee -> employee.getDepartment().getName(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .map(entry -> DashboardStatsDTO.DepartmentStatDTO.builder()
                        .departmentName(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        List<DashboardStatsDTO.DepartmentStatDTO> assetsPerDept = assetRepository.findAll().stream()
                .filter(asset -> asset.getAssignedTo() != null && asset.getAssignedTo().getDepartment() != null)
                .collect(Collectors.groupingBy(
                        asset -> asset.getAssignedTo().getDepartment().getName(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .map(entry -> DashboardStatsDTO.DepartmentStatDTO.builder()
                        .departmentName(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        return DashboardStatsDTO.builder()
                .assets(assetStats)
                .tickets(ticketStats)
                .employeesPerDepartment(employeesPerDept)
                .assetsPerDepartment(assetsPerDept) // Adăugat în DTO-ul final
                .build();
    }
}
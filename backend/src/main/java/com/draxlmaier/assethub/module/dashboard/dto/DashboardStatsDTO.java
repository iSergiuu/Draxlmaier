package com.draxlmaier.assethub.module.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import java.util.List;

@Builder
public record DashboardStatsDTO(
        AssetStatsDTO assets,
        TicketStatsDTO tickets,
        List<DepartmentStatDTO> employeesPerDepartment,
        List<DepartmentStatDTO> assetsPerDepartment
) {
    @Builder
    public record AssetStatsDTO(
            long total,
            long allocated,
            long available,
            long broken,
            long deleted
    ) {}

    @Builder
    public record TicketStatsDTO(
            long total,

            @JsonProperty("new")
            long newTickets,

            long inProgress,
            long resolved,
            long deleted
    ) {}

    @Builder
    public record DepartmentStatDTO(
            String departmentName,
            long count
    ) {}
}
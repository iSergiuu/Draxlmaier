package com.draxlmaier.assethub.module.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record DashboardStatsDTO(
        AssetStatsDTO assets,
        TicketStatsDTO tickets
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
}
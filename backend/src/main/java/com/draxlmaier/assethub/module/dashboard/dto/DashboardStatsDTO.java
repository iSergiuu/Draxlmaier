package com.draxlmaier.assethub.module.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDTO {

    private AssetStatsDTO assets;
    private TicketStatsDTO tickets;

    @Data
    @Builder
    public static class AssetStatsDTO {
        private long total;
        private long allocated;
        private long available;
        private long broken;
        private long deleted;
    }

    @Data
    @Builder
    public static class TicketStatsDTO {
        private long total;

        @JsonProperty("new")
        private long newTickets;

        private long inProgress;
        private long resolved;
        private long deleted;
    }
}
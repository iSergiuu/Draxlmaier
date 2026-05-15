package com.draxlmaier.assethub.module.dashboard.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "v_dashboard_stats")
@Data
public class DashboardStat {

    @Id
    @Column(name = "total_assets")
    private Long totalAssets;

    @Column(name = "allocated_assets")
    private Long allocatedAssets;

    @Column(name = "available_assets")
    private Long availableAssets;

    @Column(name = "broken_assets")
    private Long brokenAssets;

    @Column(name = "deleted_assets")
    private Long deletedAssets;

    @Column(name = "total_tickets")
    private Long totalTickets;

    @Column(name = "new_tickets")
    private Long newTickets;

    @Column(name = "in_progress_tickets")
    private Long inProgressTickets;

    @Column(name = "resolved_tickets")
    private Long resolvedTickets;

    @Column(name = "deleted_tickets")
    private Long deletedTickets;
}
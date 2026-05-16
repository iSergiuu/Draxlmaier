package com.draxlmaier.assethub.module.department.dto;

import java.util.UUID;

public record DepartmentStatsDTO(
        UUID departmentId,
        long totalComplaits,
        long openComplaints,
        long resolvedComplaints,
        long escalatedComplaints
){}

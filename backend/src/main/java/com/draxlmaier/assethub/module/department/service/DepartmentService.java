package com.draxlmaier.assethub.module.department.service;

import com.draxlmaier.assethub.module.department.dto.DepartmentResponseDTO;
import com.draxlmaier.assethub.module.department.dto.DepartmentStatsDTO;

import java.util.List;
import java.util.UUID;

public interface DepartmentService {
    List<DepartmentResponseDTO> getAllDepartments();

    DepartmentStatsDTO getDepartmentStats(UUID departmentId)
}
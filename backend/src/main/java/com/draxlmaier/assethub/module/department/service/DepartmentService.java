package com.draxlmaier.assethub.module.department.service;

import com.draxlmaier.assethub.module.department.dto.DepartmentRequestDTO;
import com.draxlmaier.assethub.module.department.dto.DepartmentResponseDTO;
import com.draxlmaier.assethub.module.department.dto.DepartmentStatsDTO;

import java.util.List;
import java.util.UUID;

public interface DepartmentService {
    List<DepartmentResponseDTO> getAllDepartments();

    DepartmentStatsDTO getDepartmentStats(UUID departmentId);

    DepartmentResponseDTO createDepartment(DepartmentRequestDTO request);

    DepartmentResponseDTO updateDepartment(UUID id, DepartmentRequestDTO request);

    DepartmentResponseDTO changeDepartmentManager(UUID departmentId, UUID newManagerId);

    void deleteDepartment(UUID id);
}
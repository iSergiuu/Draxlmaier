package com.draxlmaier.assethub.module.employee.service;

import com.draxlmaier.assethub.module.employee.dto.EmployeeRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.EmployeeResponseDTO;
import java.util.List;
import java.util.UUID;

public interface EmployeeService {
    EmployeeResponseDTO getEmployeeProfile(String email);
    EmployeeResponseDTO getMyProfile();
    List<EmployeeResponseDTO> getAllEmployees();

    EmployeeResponseDTO updateEmployee(UUID id, EmployeeRequestDTO request);
    EmployeeResponseDTO toggleEmployeeStatus(UUID id);

    EmployeeResponseDTO generateEmployeeCode();
}
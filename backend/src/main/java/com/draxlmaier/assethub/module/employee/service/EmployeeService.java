package com.draxlmaier.assethub.module.employee.service;

import com.draxlmaier.assethub.module.employee.dto.response.EmployeeResponseDTO;

public interface EmployeeService {
    EmployeeResponseDTO getEmployeeProfile(String email);

    EmployeeResponseDTO getMyProfile();
}
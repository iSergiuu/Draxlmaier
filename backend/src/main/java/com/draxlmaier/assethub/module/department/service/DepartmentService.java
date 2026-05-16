package com.draxlmaier.assethub.module.department.service;

import com.draxlmaier.assethub.module.department.dto.DepartmentResponseDTO;
import java.util.List;

public interface DepartmentService {
    List<DepartmentResponseDTO> getAllDepartments();

    
}
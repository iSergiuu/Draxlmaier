package com.draxlmaier.assethub.module.department.service;

import com.draxlmaier.assethub.module.department.dto.DepartmentResponseDTO;
import com.draxlmaier.assethub.module.department.model.Department;
import com.draxlmaier.assethub.module.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {
    private final DepartmentRepository departmentRepository;

    @Override
    public List<DepartmentResponseDTO> getAllDepartments(){
        return departmentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private DepartmentResponseDTO mapToDTO(Department department){
        return new DepartmentResponseDTO(
                department.getId(),
                department.getName(),
                department.getCreatedAt()
        );
    }
}

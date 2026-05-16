package com.draxlmaier.assethub.module.department.service;

import com.draxlmaier.assethub.core.exceptions.ResourceNotFoundException;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintRepository;
import com.draxlmaier.assethub.module.department.dto.DepartmentResponseDTO;
import com.draxlmaier.assethub.module.department.dto.DepartmentStatsDTO;
import com.draxlmaier.assethub.module.department.model.Department;
import com.draxlmaier.assethub.module.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    // Injectăm repository-ul de tichete pentru a putea face interogările
    private final ComplaintRepository complaintRepository;

    @Override
    public List<DepartmentResponseDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DepartmentStatsDTO getDepartmentStats(UUID departmentId) {
        // Verificăm întâi dacă departamentul există în baza de date
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Departamentul nu a fost găsit!");
        }

        // Preluăm statisticile rulând interogările definite în repository
        long total = complaintRepository.countByAuthorDepartmentId(departmentId);
        long open = complaintRepository.countByAuthorDepartmentIdAndStatusTerminalFalse(departmentId);
        long resolved = complaintRepository.countByAuthorDepartmentIdAndStatusTerminalTrue(departmentId);
        long escalated = complaintRepository.countByAuthorDepartmentIdAndEscalatedTrue(departmentId);

        // Returnăm noul DTO populat cu datele extrase
        return new DepartmentStatsDTO(departmentId, total, open, resolved, escalated);
    }

    private DepartmentResponseDTO mapToDTO(Department department) {
        return new DepartmentResponseDTO(
                department.getId(),
                department.getName(),
                department.getCreatedAt()
        );
    }
}
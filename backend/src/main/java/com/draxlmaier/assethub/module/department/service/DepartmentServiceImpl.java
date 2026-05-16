package com.draxlmaier.assethub.module.department.service;

import com.draxlmaier.assethub.core.exceptions.BusinessException;
import com.draxlmaier.assethub.core.exceptions.ResourceNotFoundException;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintRepository;
import com.draxlmaier.assethub.module.department.dto.DepartmentRequestDTO;
import com.draxlmaier.assethub.module.department.dto.DepartmentResponseDTO;
import com.draxlmaier.assethub.module.department.dto.DepartmentStatsDTO;
import com.draxlmaier.assethub.module.department.model.Department;
import com.draxlmaier.assethub.module.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;

    @Override
    public List<DepartmentResponseDTO> getAllDepartments(){
        return departmentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DepartmentStatsDTO getDepartmentStats(UUID departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Departamentul nu a fost găsit!");
        }

        long total = complaintRepository.countByAuthorDepartmentId(departmentId);
        long open = complaintRepository.countByAuthorDepartmentIdAndStatusTerminalFalse(departmentId);
        long resolved = complaintRepository.countByAuthorDepartmentIdAndStatusTerminalTrue(departmentId);
        long escalated = complaintRepository.countByAuthorDepartmentIdAndEscalatedTrue(departmentId);

        return new DepartmentStatsDTO(departmentId, total, open, resolved, escalated);
    }

    @Override
    @Transactional
    public DepartmentResponseDTO createDepartment(DepartmentRequestDTO request) {
        // Validare: nu permitem două departamente cu același nume
        if (departmentRepository.existsByName(request.name())) {
            throw new BusinessException("Un departament cu numele '" + request.name() + "' există deja!");
        }

        Department department = new Department();
        department.setName(request.name());
        department.setCreatedAt(OffsetDateTime.now());

        return mapToDTO(departmentRepository.save(department));
    }

    @Override
    @Transactional
    public DepartmentResponseDTO updateDepartment(UUID id, DepartmentRequestDTO request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamentul nu a fost găsit pentru editare!"));

        // Dacă încercăm să-i schimbăm numele într-unul care există deja la alt departament
        if (!department.getName().equals(request.name()) && departmentRepository.existsByName(request.name())) {
            throw new BusinessException("Un departament cu numele '" + request.name() + "' există deja!");
        }

        department.setName(request.name());
        return mapToDTO(departmentRepository.save(department));
    }

    @Override
    @Transactional
    public void deleteDepartment(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamentul nu a fost găsit pentru ștergere!"));

        departmentRepository.delete(department);
    }

    private DepartmentResponseDTO mapToDTO(Department department){
        return new DepartmentResponseDTO(
                department.getId(),
                department.getName(),
                department.getCreatedAt()
        );
    }
}
package com.draxlmaier.assethub.module.department.service;

import com.draxlmaier.assethub.core.exceptions.BusinessException;
import com.draxlmaier.assethub.core.exceptions.ResourceNotFoundException;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintRepository;
import com.draxlmaier.assethub.module.department.dto.DepartmentRequestDTO;
import com.draxlmaier.assethub.module.department.dto.DepartmentResponseDTO;
import com.draxlmaier.assethub.module.department.dto.DepartmentStatsDTO;
import com.draxlmaier.assethub.module.department.model.Department;
import com.draxlmaier.assethub.module.department.repository.DepartmentRepository;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.model.Role;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import com.draxlmaier.assethub.module.employee.repository.RoleRepository;
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
    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;

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
        if (departmentRepository.existsByName(request.name())) {
            throw new BusinessException("Un departament cu numele '" + request.name() + "' există deja!");
        }

        Employee manager = employeeRepository.findById(request.managerId())
                .orElseThrow(() -> new ResourceNotFoundException("Managerul specificat nu a fost găsit!"));

        promoteToDeptResponsibleIfNeeded(manager);

        Department department = new Department();
        department.setName(request.name());
        department.setManager(manager);
        department.setCreatedAt(OffsetDateTime.now());

        return mapToDTO(departmentRepository.save(department));
    }

    @Override
    @Transactional
    public DepartmentResponseDTO updateDepartment(UUID id, DepartmentRequestDTO request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamentul nu a fost găsit pentru editare!"));

        if (!department.getName().equals(request.name()) && departmentRepository.existsByName(request.name())) {
            throw new BusinessException("Un departament cu numele '" + request.name() + "' există deja!");
        }

        Employee oldManager = department.getManager();
        Employee newManager = employeeRepository.findById(request.managerId())
                .orElseThrow(() -> new ResourceNotFoundException("Managerul specificat nu a fost găsit!"));

        // Retrogradăm vechiul manager doar dacă e diferit de cel nou
        if (oldManager != null && !oldManager.getId().equals(newManager.getId())) {
            demoteManagerIfNeeded(oldManager);
        }

        promoteToDeptResponsibleIfNeeded(newManager);

        department.setName(request.name());
        department.setManager(newManager);

        return mapToDTO(departmentRepository.save(department));
    }

    @Override
    @Transactional
    public DepartmentResponseDTO changeDepartmentManager(UUID departmentId, UUID newManagerId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Departamentul nu a fost găsit!"));

        Employee oldManager = department.getManager();
        Employee newManager = employeeRepository.findById(newManagerId)
                .orElseThrow(() -> new ResourceNotFoundException("Noul manager nu a fost găsit!"));

        // Retrogradăm vechiul manager
        if (oldManager != null && !oldManager.getId().equals(newManager.getId())) {
            demoteManagerIfNeeded(oldManager);
        }

        // Promovăm noul manager
        promoteToDeptResponsibleIfNeeded(newManager);

        department.setManager(newManager);

        return mapToDTO(departmentRepository.save(department));
    }

    @Override
    @Transactional
    public void deleteDepartment(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamentul nu a fost găsit pentru ștergere!"));

        departmentRepository.delete(department);
    }

    private void promoteToDeptResponsibleIfNeeded(Employee employee) {
        if ("USER".equalsIgnoreCase(employee.getRole().getCode())) {
            Role deptRole = roleRepository.findByCode("DEPT_RESPONSIBLE")
                    .orElseThrow(() -> new RuntimeException("Rolul DEPT_RESPONSIBLE nu a fost găsit în sistem!"));

            employee.setRole(deptRole);
            employeeRepository.save(employee);
        }
    }

    private void demoteManagerIfNeeded(Employee employee) {
        // Îl trecem la USER doar dacă rolul lui actual era de responsabil.
        // Dacă e SUPER_ADMIN, își păstrează rolul.
        if ("DEPT_RESPONSIBLE".equalsIgnoreCase(employee.getRole().getCode())) {
            Role userRole = roleRepository.findByCode("USER")
                    .orElseThrow(() -> new RuntimeException("Rolul USER nu a fost găsit în sistem!"));

            employee.setRole(userRole);
            employeeRepository.save(employee);
        }
    }

    private DepartmentResponseDTO mapToDTO(Department department){
        String managerName = department.getManager() != null
                ? department.getManager().getFirstName() + " " + department.getManager().getLastName()
                : "N/A";

        UUID managerId = department.getManager() != null ? department.getManager().getId() : null;

        return new DepartmentResponseDTO(
                department.getId(),
                department.getName(),
                managerId,
                managerName,
                department.getCreatedAt()
        );
    }
}
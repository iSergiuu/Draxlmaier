package com.draxlmaier.assethub.module.employee.service;

import com.draxlmaier.assethub.core.exceptions.BusinessException;
import com.draxlmaier.assethub.module.department.model.Department;
import com.draxlmaier.assethub.module.department.repository.DepartmentRepository;
import com.draxlmaier.assethub.module.employee.dto.EmployeeRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.EmployeeResponseDTO;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.model.Role;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import com.draxlmaier.assethub.module.employee.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    public EmployeeResponseDTO getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return getEmployeeProfile(email);
    }

    @Override
    public EmployeeResponseDTO getEmployeeProfile(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Angajatul cu email-ul " + email + " nu a fost găsit!"));
        return mapToDTO(employee);
    }

    @Override
    public List<EmployeeResponseDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EmployeeResponseDTO generateEmployeeCode(){
        String uniqueCode;
        do{
            uniqueCode = "DRX-" + UUID.randomUUID().toString().substring(0,6).toUpperCase();
        } while (employeeRepository.findByEmployeeNumber(uniqueCode).isPresent());

        Employee employee = new Employee();
        employee.setEmployeeNumber(uniqueCode);

        employee.setIsActive(false);

        Role userRole = roleRepository.findByCode("USER")
                .orElseThrow(() -> new BusinessException("Rolul USER nu a fost gasit in baza de date!"));
        employee.setRole(userRole);

        return mapToDTO(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public EmployeeResponseDTO updateEmployee(UUID id, EmployeeRequestDTO request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Angajatul nu a fost găsit!"));

        // 1. Actualizăm Rolul (dacă a fost trimis)
        if (request.roleCode() != null && !request.roleCode().isBlank()) {
            Role role = roleRepository.findByCode(request.roleCode())
                    .orElseThrow(() -> new BusinessException("Rolul specificat nu există!"));
            employee.setRole(role);
        }

        // 2. Actualizăm Departamentul (dacă a fost trimis)
        if (request.departmentId() != null) {
            Department department = departmentRepository.findById(request.departmentId())
                    .orElseThrow(() -> new BusinessException("Departamentul specificat nu există!"));
            employee.setDepartment(department);
        } else {
            // Dacă trimitem null din frontend, înseamnă că îl scoatem din departament
            employee.setDepartment(null);
        }

        return mapToDTO(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public EmployeeResponseDTO toggleEmployeeStatus(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Angajatul nu a fost găsit!"));

        // Inversăm statusul (dacă e true devine false, dacă e false devine true)
        employee.setIsActive(!employee.getIsActive());

        return mapToDTO(employeeRepository.save(employee));
    }

    // Metoda privată de mapare (neschimbată)
    private EmployeeResponseDTO mapToDTO(Employee employee) {
        String departmentName = employee.getDepartment() != null ? employee.getDepartment().getName() : "Neatribuit";
        String roleCode = employee.getRole() != null ? employee.getRole().getCode() : "USER";

        return new EmployeeResponseDTO(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getEmployeeNumber(),
                departmentName,
                roleCode,
                employee.getIsActive(),
                employee.getCreatedAt()
        );
    }
}
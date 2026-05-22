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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

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
    public List<EmployeeResponseDTO> generateEmployeeCodes(UUID departmentId, int count) {
        // 1. Căutăm departamentul o singură dată, înainte de buclă
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new BusinessException("Departamentul specificat nu există!"));

        Role userRole = roleRepository.findByCode("USER")
                .orElseThrow(() -> new BusinessException("Rolul USER nu a fost găsit în baza de date!"));

        List<EmployeeResponseDTO> createdEmployees = new ArrayList<>();
        String passwordHash = passwordEncoder.encode("Temp123!");

        // 2. Rulăm bucla pentru a genera numărul exact de conturi cerut
        for (int i = 0; i < count; i++) {
            String uniqueSuffix;
            String uniqueCode;
            String tempEmail;

            // Generăm combinații unice pentru fiecare cont în parte
            do {
                uniqueSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
                uniqueCode = "DRX-" + uniqueSuffix;
                tempEmail = "temp_" + uniqueSuffix.toLowerCase() + "@draxlmaier.com";
            } while (employeeRepository.findByEmployeeNumber(uniqueCode).isPresent() ||
                    employeeRepository.findByEmail(tempEmail).isPresent());

            Employee employee = new Employee();
            employee.setEmployeeNumber(uniqueCode);
            employee.setFirstName("Test");
            employee.setLastName("Test");
            employee.setEmail(tempEmail);
            employee.setPasswordHash(passwordHash);
            employee.setIsActive(false);
            employee.setRole(userRole);
            employee.setDepartment(department);

            // Salvăm angajatul și îl adăugăm în lista de răspuns
            Employee savedEmployee = employeeRepository.save(employee);
            createdEmployees.add(mapToDTO(savedEmployee));
        }

        // Returnăm lista cu toate conturile generate
        return createdEmployees;
    }

    @Override
    @Transactional
    public EmployeeResponseDTO updateEmployee(UUID id, EmployeeRequestDTO request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Angajatul nu a fost găsit!"));

        if (request.roleCode() != null && !request.roleCode().isBlank()) {
            Role role = roleRepository.findByCode(request.roleCode())
                    .orElseThrow(() -> new BusinessException("Rolul specificat nu există!"));
            employee.setRole(role);
        }

        if (request.departmentId() != null) {
            Department department = departmentRepository.findById(request.departmentId())
                    .orElseThrow(() -> new BusinessException("Departamentul specificat nu există!"));
            employee.setDepartment(department);
        } else {
            employee.setDepartment(null);
        }

        return mapToDTO(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public EmployeeResponseDTO toggleEmployeeStatus(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Angajatul nu a fost găsit!"));

        employee.setIsActive(!employee.getIsActive());

        return mapToDTO(employeeRepository.save(employee));
    }

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
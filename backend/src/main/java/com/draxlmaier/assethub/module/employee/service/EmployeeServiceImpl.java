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
    @Transactional(readOnly = true) // ADĂUGAT: Ține sesiunea deschisă pentru a citi profilul curent
    public EmployeeResponseDTO getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return getEmployeeProfile(email);
    }

    @Override
    @Transactional(readOnly = true) // ADĂUGAT: Ține sesiunea deschisă pentru a citi profilul unui user
    public EmployeeResponseDTO getEmployeeProfile(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Angajatul cu email-ul " + email + " nu a fost găsit!"));
        return mapToDTO(employee);
    }

    @Override
    @Transactional(readOnly = true) // ADĂUGAT: Ține sesiunea deschisă pentru toată lista
    public List<EmployeeResponseDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<EmployeeResponseDTO> generateEmployeeCodes(UUID departmentId, int count) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new BusinessException("Departamentul specificat nu există!"));

        Role userRole = roleRepository.findByCode("USER")
                .orElseThrow(() -> new BusinessException("Rolul USER nu a fost găsit în baza de date!"));

        List<EmployeeResponseDTO> createdEmployees = new ArrayList<>();
        String passwordHash = passwordEncoder.encode("Temp123!");

        for (int i = 0; i < count; i++) {
            String uniqueSuffix;
            String uniqueCode;
            String tempEmail;

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

            Employee savedEmployee = employeeRepository.save(employee);
            createdEmployees.add(mapToDTO(savedEmployee));
        }

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

    @Override
    @Transactional
    public EmployeeResponseDTO changeEmployeeRole(UUID id, String roleCode) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Angajatul nu a fost găsit!"));

        Role newRole = roleRepository.findByCode(roleCode.toUpperCase())
                .orElseThrow(() -> new BusinessException("Rolul " + roleCode + " nu a fost găsit în baza de date!"));

        employee.setRole(newRole);

        return mapToDTO(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public void deleteAllTemporaryAccounts() {
        List<Employee> tempAccounts = employeeRepository.findByIsActiveFalseAndEmailStartingWith("temp_");
        employeeRepository.deleteAll(tempAccounts);
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
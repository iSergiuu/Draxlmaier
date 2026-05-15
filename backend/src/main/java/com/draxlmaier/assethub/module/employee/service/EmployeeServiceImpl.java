package com.draxlmaier.assethub.module.employee.service;

import com.draxlmaier.assethub.core.exceptions.BusinessException;
import com.draxlmaier.assethub.module.employee.dto.response.EmployeeResponseDTO;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Override
    public EmployeeResponseDTO getMyProfile() {
        // Luăm email-ul utilizatorului logat din Spring Security Context
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // Apelăm logica de căutare de mai jos
        return getEmployeeProfile(email);
    }

    @Override
    public EmployeeResponseDTO getEmployeeProfile(String email) {
        // 1. Căutăm angajatul în baza de date
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Angajatul cu email-ul " + email + " nu a fost găsit!"));

        long ticketCount = 5;

        String departmentName = employee.getDepartment() != null ? employee.getDepartment().getName() : "N/A";
        String roleCode = employee.getRole() != null ? employee.getRole().getCode() : "USER";

        return new EmployeeResponseDTO(
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getEmployeeNumber(),
                departmentName,
                roleCode,
                employee.getCreatedAt(),
                ticketCount
        );
    }
}
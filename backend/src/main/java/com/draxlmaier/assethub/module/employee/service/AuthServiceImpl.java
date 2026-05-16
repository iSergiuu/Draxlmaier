package com.draxlmaier.assethub.module.employee.service;

import com.draxlmaier.assethub.core.exceptions.BusinessException;
import com.draxlmaier.assethub.core.security.JwtUtil;
import com.draxlmaier.assethub.module.employee.dto.LoginRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.RegisterRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.AuthResponseDTO;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import com.draxlmaier.assethub.module.employee.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        Employee employee = employeeRepository.findByEmployeeNumber(request.employeeNumber())
                .orElseThrow(() -> new BusinessException("Numărul de angajat " + request.employeeNumber() + " nu a fost găsit!"));

        if (employee.getPasswordHash() != null) {
            throw new BusinessException("Acest angajat are deja un cont creat!");
        }

        if (employeeRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email-ul " + request.email() + " este deja utilizat!");
        }

        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());
        employee.setPasswordHash(passwordEncoder.encode(request.password()));
        employee.setIsActive(true);

        employeeRepository.save(employee);

        String token = jwtUtil.generateToken(employee.getEmail());

        return new AuthResponseDTO(token, employee.getEmail(), employee.getRole().getCode(), employee.getId());
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        Employee employee = employeeRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Email sau parolă incorectă!"));

        if (!passwordEncoder.matches(request.password(), employee.getPasswordHash())) {
            throw new BusinessException("Email sau parolă incorectă!");
        }

        if (!employee.getIsActive()) {
            throw new BusinessException("Contul dumneavoastră este dezactivat!");
        }

        String token = jwtUtil.generateToken(employee.getEmail());

        return new AuthResponseDTO(token, employee.getEmail(), employee.getRole().getCode(), employee.getId());
    }
}
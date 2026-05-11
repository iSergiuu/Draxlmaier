package com.draxlmaier.assethub.module.employee.service;

import com.draxlmaier.assethub.core.exceptions.BusinessException;
import com.draxlmaier.assethub.core.security.JwtUtil;
import com.draxlmaier.assethub.module.employee.dto.request.LoginRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.request.RegisterRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.response.AuthResponseDTO;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponseDTO register(RegisterRequestDTO request) {
        Employee employee = employeeRepository.findBySecurityNumberAndIsRegisteredFalse(request.getSecurityNumber())
                .orElseThrow(() -> new BusinessException("Security Number invalid sau deja înregistrat!"));

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Acest email este deja utilizat!");
        }

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setIsRegistered(true);

        employeeRepository.save(employee);

        String token = jwtUtil.generateToken(employee.getEmail());
        return new AuthResponseDTO(token, employee.getEmail(), employee.getRole().name());
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        Employee employee = employeeRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Email sau parolă incorectă!"));

        if (!passwordEncoder.matches(request.getPassword(), employee.getPassword())) {
            throw new BusinessException("Email sau parolă incorectă!");
        }

        String token = jwtUtil.generateToken(employee.getEmail());

        return new AuthResponseDTO(token, employee.getEmail(), employee.getRole().name());
    }
}
package com.draxlmaier.assethub.module.employee.service;

import com.draxlmaier.assethub.core.exceptions.BusinessException;
import com.draxlmaier.assethub.core.security.JwtUtil;
import com.draxlmaier.assethub.module.employee.dto.request.LoginRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.request.RegisterRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.response.AuthResponseDTO;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.model.Role;
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
        Employee employee = employeeRepository.findByEmployeeNumber(request.getEmployeeNumber())
                .orElseThrow(() -> new BusinessException("Numărul de angajat " + request.getEmployeeNumber() + " nu a fost găsit!"));

        if (employee.getPasswordHash() != null) {
            throw new BusinessException("Acest angajat are deja un cont creat!");
        }

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email-ul " + request.getEmail() + " este deja utilizat!");
        }

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        employee.setIsActive(true);

        employeeRepository.save(employee);

        String token = jwtUtil.generateToken(employee.getEmail());

        return new AuthResponseDTO(token, employee.getEmail(), employee.getRole().getCode(), employee.getId());
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        Employee employee = employeeRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Email sau parolă incorectă!"));

        if (!passwordEncoder.matches(request.getPassword(), employee.getPasswordHash())) {
            throw new BusinessException("Email sau parolă incorectă!");
        }

        if (!employee.getIsActive()) {
            throw new BusinessException("Contul dumneavoastră este dezactivat!");
        }

        String token = jwtUtil.generateToken(employee.getEmail());

        return new AuthResponseDTO(token, employee.getEmail(), employee.getRole().getCode(), employee.getId());
    }
}
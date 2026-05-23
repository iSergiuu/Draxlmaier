package com.draxlmaier.assethub.module.auth.service;

import com.draxlmaier.assethub.core.exceptions.BusinessException;
import com.draxlmaier.assethub.core.security.JwtUtil;
import com.draxlmaier.assethub.module.employee.dto.LoginRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.RegisterRequestDTO;
import com.draxlmaier.assethub.module.auth.dto.AuthResponseDTO;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import com.draxlmaier.assethub.module.employee.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

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
        // 1. Căutăm contul după codul DRX generat anterior
        Employee employee = employeeRepository.findByEmployeeNumber(request.employeeNumber())
                .orElseThrow(() -> new BusinessException("Numărul de angajat " + request.employeeNumber() + " nu a fost găsit!"));

        // 2. Verificăm dacă a fost deja finalizat contul
        if (employee.getIsActive()) {
            throw new BusinessException("Acest angajat are deja contul activat și finalizat!");
        }

        // 3. Ne asigurăm că email-ul nou introdus nu este folosit deja de ALT utilizator
        Optional<Employee> existingEmail = employeeRepository.findByEmail(request.email());
        if (existingEmail.isPresent() && !existingEmail.get().getId().equals(employee.getId())) {
            throw new BusinessException("Email-ul " + request.email() + " este deja utilizat!");
        }

        // 4. Suprascriem datele temporare ("Test", "temp_...", etc.) cu datele reale introduse
        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());
        employee.setPasswordHash(passwordEncoder.encode(request.password()));

        // 5. Activăm oficial contul
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

        // Dacă contul e inactiv, verificăm dacă e un cont temporar
        if (!employee.getIsActive()) {
            // Dacă email-ul NU este cel generat temporar, înseamnă că e un cont real care a fost suspendat/dezactivat
            if (!employee.getEmail().startsWith("temp_")) {
                throw new BusinessException("Contul dumneavoastră este dezactivat!");
            }
            // Dacă începe cu "temp_", îl lăsăm să treacă pentru ca React-ul să-l redirecționeze la /register
        }

        String token = jwtUtil.generateToken(employee.getEmail());

        return new AuthResponseDTO(token, employee.getEmail(), employee.getRole().getCode(), employee.getId());
    }
}
package com.draxlmaier.assethub.module.auth.service;

import com.draxlmaier.assethub.module.employee.dto.RegisterRequestDTO;
import com.draxlmaier.assethub.module.auth.dto.AuthResponseDTO;
import com.draxlmaier.assethub.module.employee.dto.LoginRequestDTO;

public interface AuthService {
    AuthResponseDTO register(RegisterRequestDTO request);
    AuthResponseDTO login(LoginRequestDTO request);
}
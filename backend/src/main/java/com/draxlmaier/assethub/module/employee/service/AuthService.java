package com.draxlmaier.assethub.module.employee.service;

import com.draxlmaier.assethub.module.employee.dto.request.RegisterRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.response.AuthResponseDTO;
import com.draxlmaier.assethub.module.employee.dto.request.LoginRequestDTO;

public interface AuthService {
    AuthResponseDTO register(RegisterRequestDTO request);
    AuthResponseDTO login(LoginRequestDTO request);
}
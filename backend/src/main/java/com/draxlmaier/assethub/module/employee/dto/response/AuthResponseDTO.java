package com.draxlmaier.assethub.module.employee.dto.response;

import java.util.UUID;

// Am transformat clasa într-un 'record', scăpând de Lombok
public record AuthResponseDTO(
        String accessToken,
        String email,
        String role,
        UUID userId
) {}
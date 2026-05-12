package com.draxlmaier.assethub.module.employee.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String accessToken;
    private String email;
    private String role;
    private UUID userId;
}
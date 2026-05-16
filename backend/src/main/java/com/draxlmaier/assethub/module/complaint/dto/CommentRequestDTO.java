package com.draxlmaier.assethub.module.complaint.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record CommentRequestDTO(
        @NotBlank(message = "Mesajul este obligatoriu")
        String message,

        @JsonProperty("isInternal")
        boolean isInternal
) {}
package com.draxlmaier.assethub.module.complaint.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record FeedbackRequestDTO(
        @NotNull(message = "Nota este obligatorie")
        @Min(value = 1, message = "Nota minimă este 1")
        @Max(value = 5, message = "Nota maximă este 5")
        Integer rating,

        String comment
) {}
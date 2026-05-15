package com.draxlmaier.assethub.module.complaint.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty; // Adaugă acest import
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequestDTO {
    @NotBlank
    private String message;

    @JsonProperty("isInternal")
    private boolean isInternal;
}
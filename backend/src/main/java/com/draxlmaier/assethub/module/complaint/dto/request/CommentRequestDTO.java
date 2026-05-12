package com.draxlmaier.assethub.module.complaint.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequestDTO {
    @NotBlank
    private String message;
    private boolean isInternal;
}
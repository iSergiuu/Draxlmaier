package com.draxlmaier.assethub.module.complaint.mapper;

import com.draxlmaier.assethub.module.complaint.dto.response.WorkflowResponseDTO;
import com.draxlmaier.assethub.module.complaint.model.ComplaintWorkflow;
import org.springframework.stereotype.Component;

@Component
public class WorkflowMapper {

    public WorkflowResponseDTO toResponseDTO(ComplaintWorkflow entity) {
        if (entity == null) return null;

        return WorkflowResponseDTO.builder()
                .changedBy(entity.getChangedBy().getFirstName() + " " + entity.getChangedBy().getLastName())
                .oldStatus(entity.getOldStatus() != null ? entity.getOldStatus().getCode() : "START")
                .newStatus(entity.getNewStatus().getCode())
                .comment(entity.getComment())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
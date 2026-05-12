package com.draxlmaier.assethub.module.complaint.mapper;

import com.draxlmaier.assethub.module.complaint.dto.request.ComplaintRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.response.ComplaintResponseDTO;
import com.draxlmaier.assethub.module.complaint.model.Complaint;
import org.springframework.stereotype.Component;

@Component
public class ComplaintMapper {

    public Complaint toEntity(ComplaintRequestDTO dto) {
        if (dto == null) return null;

        return Complaint.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM")
                .build();
    }

    public ComplaintResponseDTO toResponseDTO(Complaint entity) {
        if (entity == null) return null;

        return ComplaintResponseDTO.builder()
                .id(entity.getId())
                .ticketNumber(entity.getTicketNumber())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .priority(entity.getPriority())
                .createdAt(entity.getCreatedAt())
                .resolvedAt(entity.getResolvedAt())
                .assetId(entity.getAsset().getId())
                .assetName(entity.getAsset().getName())
                .authorName(entity.getAuthor().getFirstName() + " " + entity.getAuthor().getLastName())
                .statusId(entity.getStatus().getId().toString())
                .statusCode(entity.getStatus().getCode())
                .build();
    }
}
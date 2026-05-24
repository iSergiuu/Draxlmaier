package com.draxlmaier.assethub.module.complaint.mapper;

import com.draxlmaier.assethub.module.complaint.dto.ComplaintRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.ComplaintResponseDTO;
import com.draxlmaier.assethub.module.complaint.model.Complaint;
import org.springframework.stereotype.Component;

@Component
public class ComplaintMapper {

    public Complaint toEntity(ComplaintRequestDTO dto) {
        if (dto == null) return null;

        return Complaint.builder()
                .title(dto.title())
                .description(dto.description())
                .priority(dto.priority() != null ? dto.priority() : "MEDIUM")
                .build();
    }

    public ComplaintResponseDTO toResponseDTO(Complaint entity) {
        if (entity == null) return null;

        // Adăugăm verificări de null pentru fiecare relație ca să prevenim erorile 500
        return ComplaintResponseDTO.builder()
                .id(entity.getId())
                .ticketNumber(entity.getTicketNumber())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .priority(entity.getPriority())
                .createdAt(entity.getCreatedAt())
                .resolvedAt(entity.getResolvedAt())

                .assetId(entity.getAsset() != null ? entity.getAsset().getId() : null)
                .assetName(entity.getAsset() != null ? entity.getAsset().getName() : "Fără echipament")

                .authorName(entity.getAuthor() != null ? entity.getAuthor().getFirstName() + " " + entity.getAuthor().getLastName() : "Sistem")

                .statusId(entity.getStatus() != null ? entity.getStatus().getId().toString() : null)
                .statusCode(entity.getStatus() != null ? entity.getStatus().getCode() : "N/A")

                .build();
    }
}
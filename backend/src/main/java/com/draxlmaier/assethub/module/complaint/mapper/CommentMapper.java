package com.draxlmaier.assethub.module.complaint.mapper;

import com.draxlmaier.assethub.module.complaint.dto.CommentRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.CommentResponseDTO;
import com.draxlmaier.assethub.module.complaint.model.ComplaintComment;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    public ComplaintComment toEntity(CommentRequestDTO dto) {
        if (dto == null) return null;

        return ComplaintComment.builder()
                .message(dto.message()) // Modificat pentru Record
                .internal(dto.isInternal())
                .build();
    }

    public CommentResponseDTO toResponseDTO(ComplaintComment entity) {
        if (entity == null) return null;

        return CommentResponseDTO.builder()
                .id(entity.getId())
                .message(entity.getMessage())
                .isInternal(entity.isInternal())
                .createdAt(entity.getCreatedAt())
                .authorName(entity.getAuthor().getFirstName() + " " + entity.getAuthor().getLastName())
                .build();
    }
}
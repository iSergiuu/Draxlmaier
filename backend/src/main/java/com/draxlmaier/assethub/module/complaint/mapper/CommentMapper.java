package com.draxlmaier.assethub.module.complaint.mapper;

import com.draxlmaier.assethub.module.complaint.dto.request.CommentRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.response.CommentResponseDTO;
import com.draxlmaier.assethub.module.complaint.model.ComplaintComment;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    public ComplaintComment toEntity(CommentRequestDTO dto) {
        if (dto == null) return null;

        return ComplaintComment.builder()
                .message(dto.getMessage())
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
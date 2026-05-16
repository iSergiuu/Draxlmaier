package com.draxlmaier.assethub.module.complaint.service;

import com.draxlmaier.assethub.module.complaint.dto.CommentRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.CommentResponseDTO;

import java.util.List;
import java.util.UUID;

public interface CommentService {
    CommentResponseDTO addComment(UUID complaintId, CommentRequestDTO requestDTO);
    List<CommentResponseDTO> getCommentsByComplaintId(UUID complaintId);
}
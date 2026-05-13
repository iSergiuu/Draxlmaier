package com.draxlmaier.assethub.module.complaint.service;

import com.draxlmaier.assethub.module.complaint.dto.request.CommentRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.response.CommentResponseDTO;

import java.util.List;
import java.util.UUID;

public interface CommentService {
    CommentResponseDTO addComment(UUID complaintId, CommentRequestDTO requestDTO);
    List<CommentResponseDTO> getCommentsByComplaintId(UUID complaintId);
}
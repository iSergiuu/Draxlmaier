package com.draxlmaier.assethub.module.complaint.service;

import com.draxlmaier.assethub.module.complaint.dto.FeedbackRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.FeedbackResponseDTO;

import java.util.UUID;

public interface ComplaintFeedbackService {
    FeedbackResponseDTO submitFeedback(UUID complaintId, FeedbackRequestDTO requestDTO);
    FeedbackResponseDTO getFeedbackByComplaintId(UUID complaintId);
}
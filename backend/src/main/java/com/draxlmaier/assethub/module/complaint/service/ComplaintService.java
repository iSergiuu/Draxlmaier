package com.draxlmaier.assethub.module.complaint.service;

import com.draxlmaier.assethub.module.complaint.dto.request.ComplaintRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.request.StatusChangeRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.response.ComplaintResponseDTO;
import com.draxlmaier.assethub.module.complaint.dto.response.WorkflowResponseDTO;

import java.util.List;
import java.util.UUID;

public interface ComplaintService {
    ComplaintResponseDTO createComplaint(ComplaintRequestDTO requestDTO);
    ComplaintResponseDTO getComplaintById(UUID id);
    List<ComplaintResponseDTO> getAllComplaints();
    ComplaintResponseDTO updateStatus(UUID id, StatusChangeRequestDTO statusDTO);

    List<WorkflowResponseDTO> getComplaintWorkflow(UUID complaintId);
}
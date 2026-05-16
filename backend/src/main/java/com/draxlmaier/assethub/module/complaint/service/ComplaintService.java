package com.draxlmaier.assethub.module.complaint.service;

import com.draxlmaier.assethub.module.complaint.dto.ComplaintRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.StatusChangeRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.ComplaintResponseDTO;
import com.draxlmaier.assethub.module.complaint.dto.WorkflowResponseDTO;

import java.util.List;
import java.util.UUID;

public interface ComplaintService {
    ComplaintResponseDTO createComplaint(ComplaintRequestDTO requestDTO);
    ComplaintResponseDTO getComplaintById(UUID id);
    List<ComplaintResponseDTO> getAllComplaints();
    ComplaintResponseDTO updateStatus(UUID id, StatusChangeRequestDTO statusDTO);

    List<WorkflowResponseDTO> getComplaintWorkflow(UUID complaintId);
}
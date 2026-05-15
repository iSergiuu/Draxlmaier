package com.draxlmaier.assethub.module.complaint.repository;

import com.draxlmaier.assethub.module.complaint.model.ComplaintWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ComplaintWorkflowRepository extends JpaRepository<ComplaintWorkflow, UUID> {
    List<ComplaintWorkflow> findAllByComplaintIdOrderByCreatedAtAsc(UUID complaintId);
}
package com.draxlmaier.assethub.module.complaint.repository;

import com.draxlmaier.assethub.module.complaint.model.ComplaintWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintWorkflowRepository extends JpaRepository<ComplaintWorkflow, UUID> {
    List<ComplaintWorkflow> findAllByComplaintIdOrderByCreatedAtDesc(UUID complaintId);
}
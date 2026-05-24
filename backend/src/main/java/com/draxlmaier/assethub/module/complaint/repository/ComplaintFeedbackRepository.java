package com.draxlmaier.assethub.module.complaint.repository;

import com.draxlmaier.assethub.module.complaint.model.ComplaintFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplaintFeedbackRepository extends JpaRepository<ComplaintFeedback, UUID> {

    Optional<ComplaintFeedback> findByComplaintId(UUID complaintId);

    boolean existsByComplaintId(UUID complaintId);
}
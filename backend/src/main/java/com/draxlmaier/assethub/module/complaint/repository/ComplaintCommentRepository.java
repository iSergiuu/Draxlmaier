package com.draxlmaier.assethub.module.complaint.repository;

import com.draxlmaier.assethub.module.complaint.model.ComplaintComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintCommentRepository extends JpaRepository<ComplaintComment, Integer> {
    List<ComplaintComment> findByComplaintIdOrderByCreatedAtDesc(Long complaintId);
}
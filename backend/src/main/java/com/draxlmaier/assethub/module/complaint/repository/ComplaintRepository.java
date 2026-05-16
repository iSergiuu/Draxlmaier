package com.draxlmaier.assethub.module.complaint.repository;

import com.draxlmaier.assethub.module.complaint.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {
}
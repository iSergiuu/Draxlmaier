package com.draxlmaier.assethub.module.complaint.repository;

import com.draxlmaier.assethub.module.complaint.model.Complaint;
import com.draxlmaier.assethub.module.complaint.model.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {
    List<Complaint> findByStatus(ComplaintStatus status);
}
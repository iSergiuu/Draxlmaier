package com.draxlmaier.assethub.module.complaint.repository;

import com.draxlmaier.assethub.module.complaint.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

    long countByAuthorDepartmentId(UUID departmentId);

    long countByAuthorDepartmentIdAndStatusTerminalFalse(UUID departmentId);

    long countByAuthorDepartmentIdAndStatusTerminalTrue(UUID departmentId);

    long countByAuthorDepartmentIdAndEscalatedTrue(UUID departmentId);

    List<Complaint> findAllByAuthorEmail(String email);
}
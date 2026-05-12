package com.draxlmaier.assethub.module.complaint.model;

import com.draxlmaier.assethub.module.employee.model.Employee;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.time.OffsetDateTime;

@Entity
@Table(name = "complaint_workflow")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintWorkflow {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_id", nullable = false)
    private Employee changedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "old_status_id")
    private ComplaintStatus oldStatus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "new_status_id", nullable = false)
    private ComplaintStatus newStatus;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
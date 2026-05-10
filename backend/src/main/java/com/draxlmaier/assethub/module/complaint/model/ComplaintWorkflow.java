package com.draxlmaier.assethub.module.complaint.model;

import com.draxlmaier.assethub.module.complaint.model.enums.ComplaintStatus;
import com.draxlmaier.assethub.module.employee.model.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "COMPLAINT_WORKFLOW")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintWorkflow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "workflow_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empl_id")
    private Employee modifier;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status")
    private ComplaintStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status")
    private ComplaintStatus currentStatus;

    @Column(name = "changed_at")
    private LocalDateTime changedAt;
}
package com.draxlmaier.assethub.module.complaint.model;

import com.draxlmaier.assethub.module.employee.model.Employee;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.time.OffsetDateTime;

@Entity
@Table(name = "complaint_comments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintComment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Employee author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_internal")
    private Boolean isInternal = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;
}
package com.draxlmaier.assethub.module.complaint.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaint_feedbacks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false, unique = true)
    private Complaint complaint;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
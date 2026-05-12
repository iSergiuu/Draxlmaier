package com.draxlmaier.assethub.module.complaint.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "complaint_statuses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String code;

    private String description;

    @Column(name = "is_terminal")
    private Boolean isTerminal;

    @Column(name = "sort_order")
    private Short sortOrder;
}
package com.draxlmaier.assethub.module.complaint.model;

import com.draxlmaier.assethub.module.asset.model.Asset;
import com.draxlmaier.assethub.module.complaint.model.enums.ComplaintStatus;
import com.draxlmaier.assethub.module.employee.model.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COMPLAINT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "complaint_id")
    private Integer id;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ComplaintStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empl_id")
    private Employee reporter;
}
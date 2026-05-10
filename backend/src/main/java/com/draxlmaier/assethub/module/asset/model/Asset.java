package com.draxlmaier.assethub.module.asset.model;

import com.draxlmaier.assethub.module.employee.model.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ASSET")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    private Integer id;

    @Column(name = "name")
    private String name;

    @Column(name = "serial_number")
    private String serialNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empl_id")
    private Employee owner;
}
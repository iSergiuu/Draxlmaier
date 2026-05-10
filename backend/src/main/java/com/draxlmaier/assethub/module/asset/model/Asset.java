package com.draxlmaier.assethub.module.asset.model;

import com.draxlmaier.assethub.module.asset.model.enums.AssetType;
import com.draxlmaier.assethub.module.employee.model.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Completeaza-ma") // TODO: Numele tabelului pentru Echipamente
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Completeaza-ma") // TODO: Numele coloanei ID
    private Long id;

    @Column(name = "Completeaza-ma") // TODO: Nume coloană denumire echipament
    private String name;

    @Column(name = "Completeaza-ma") // TODO: Nume coloană număr de serie (Serial Number)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "Completeaza-ma") // TODO: Nume coloană tip echipament
    private AssetType type;

    @ManyToOne
    @JoinColumn(name = "Completeaza-ma") // TODO: Nume coloană Foreign Key către ID-ul Angajatului
    private Employee owner;
}

package com.draxlmaier.assethub.module.department.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "Completeaza-ma") // TODO: Numele tabelului pentru Departamente
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Completeaza-ma") // TODO: Numele coloanei ID
    private Long id;

    @Column(name = "Completeaza-ma") // TODO: Numele coloanei pentru denumirea departamentului
    private String name;
}

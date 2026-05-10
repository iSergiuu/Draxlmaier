package com.draxlmaier.assethub.module.employee.model;

import com.draxlmaier.assethub.module.department.model.Department;
import com.draxlmaier.assethub.module.employee.model.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Completeaza-ma") // TODO: Numele tabelului pentru Angajați
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Completeaza-ma") // TODO: Numele coloanei ID
    private Long id;

    @Column(name = "Completeaza-ma") // TODO: Nume coloană prenume
    private String firstName;

    @Column(name = "Completeaza-ma") // TODO: Nume coloană nume de familie
    private String lastName;

    @Column(name = "Completeaza-ma") // TODO: Nume coloană email
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "Completeaza-ma") // TODO: Nume coloană rol
    private Role role;

    @ManyToOne
    @JoinColumn(name = "Completeaza-ma") // TODO: Nume coloană Foreign Key către ID-ul Departamentului
    private Department department;
}

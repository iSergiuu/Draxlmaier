package com.draxlmaier.assethub.module.complaint.model;

import com.draxlmaier.assethub.module.asset.model.Asset;
import com.draxlmaier.assethub.module.complaint.model.enums.ComplaintStatus;
import com.draxlmaier.assethub.module.employee.model.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "Completeaza-ma") // TODO: Numele tabelului pentru Plângeri
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Completeaza-ma") // TODO: Numele coloanei ID
    private Long id;

    @Column(name = "Completeaza-ma") // TODO: Nume coloană titlu problemă
    private String title;

    @Column(name = "Completeaza-ma") // TODO: Nume coloană descriere detaliată
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "Completeaza-ma") // TODO: Nume coloană status plângere
    private ComplaintStatus status;

    @Column(name = "Completeaza-ma") // TODO: Nume coloană data creării
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "Completeaza-ma") // TODO: Nume coloană Foreign Key către ID-ul Echipamentului defect
    private Asset asset;

    @ManyToOne
    @JoinColumn(name = "Completeaza-ma") // TODO: Nume coloană Foreign Key către ID-ul Angajatului care raportează
    private Employee reporter;
}

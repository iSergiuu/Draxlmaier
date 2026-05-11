package com.draxlmaier.assethub.module.employee.model;

import com.draxlmaier.assethub.module.department.model.Department;
import com.draxlmaier.assethub.module.employee.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employee")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "empl_id")
    private Integer id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password")
    private String password;

    @Column(name = "security_number")
    private String securityNumber;

    @Column(name = "is_registered")
    private Boolean isRegistered = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id")
    private Department department;
}
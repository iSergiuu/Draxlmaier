package com.draxlmaier.assethub.module.employee.repository;

import com.draxlmaier.assethub.module.employee.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmployeeNumber(String employeeNumber);

    boolean existsByEmail(String email);

    List<Employee> findAllByRoleCode(String roleCode);
}
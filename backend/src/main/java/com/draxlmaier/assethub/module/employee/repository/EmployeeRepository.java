package com.draxlmaier.assethub.module.employee.repository;

import com.draxlmaier.assethub.module.employee.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findBySecurityNumberAndIsRegisteredFalse(String securityNumber);
    boolean existsByEmail(String email);
}
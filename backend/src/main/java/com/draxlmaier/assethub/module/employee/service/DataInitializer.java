package com.draxlmaier.assethub.module.employee.service;

import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.model.enums.Role;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;

    @Override
    public void run(String... args) {
        if (employeeRepository.count() == 0) {
            Employee testEmployee = new Employee();
            testEmployee.setFirstName("Manager");
            testEmployee.setLastName("Test");
            testEmployee.setEmail("manager@test.com");
            testEmployee.setSecurityNumber("ABC-123");
            testEmployee.setIsRegistered(false);
            testEmployee.setRole(Role.USER);

            employeeRepository.save(testEmployee);
            System.out.println(">> Baza de date temporară a fost populată cu codul: ABC-123");
        }
    }
}
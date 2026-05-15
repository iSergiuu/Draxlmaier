package com.draxlmaier.assethub.module.employee.controller;

import com.draxlmaier.assethub.module.employee.dto.response.EmployeeResponseDTO;
import com.draxlmaier.assethub.module.employee.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/me")
    public ResponseEntity<EmployeeResponseDTO> getMyProfile() {
        return ResponseEntity.ok(employeeService.getMyProfile());
    }
}
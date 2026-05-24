package com.draxlmaier.assethub.module.employee.controller;

import com.draxlmaier.assethub.module.employee.dto.EmployeeRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.EmployeeResponseDTO;
import com.draxlmaier.assethub.module.employee.dto.RoleChangeRequestDTO;
import com.draxlmaier.assethub.module.employee.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ADMIN', 'ROLE_ADMIN', 'DEPT_RESPONSIBLE', 'ROLE_DEPT_RESPONSIBLE')")
    public ResponseEntity<List<EmployeeResponseDTO>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<EmployeeResponseDTO> updateEmployee(@PathVariable UUID id, @RequestBody EmployeeRequestDTO request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<EmployeeResponseDTO> toggleEmployeeStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.toggleEmployeeStatus(id));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<EmployeeResponseDTO> changeRole(
            @PathVariable UUID id,
            @Valid @RequestBody RoleChangeRequestDTO request) {
        return ResponseEntity.ok(employeeService.changeEmployeeRole(id, request.roleCode()));
    }

    @PostMapping("/generate-temp-account")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'DEPT_RESPONSIBLE', 'ROLE_DEPT_RESPONSIBLE')")
    public ResponseEntity<List<EmployeeResponseDTO>> generateTempAccounts(
            @RequestParam UUID departmentId,
            @RequestParam int count) {
        return ResponseEntity.ok(employeeService.generateEmployeeCodes(departmentId, count));
    }

    @DeleteMapping("/temporary-accounts")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'DEPT_RESPONSIBLE', 'ROLE_DEPT_RESPONSIBLE')")
    public ResponseEntity<Void> deleteAllTemporaryAccounts() {
        employeeService.deleteAllTemporaryAccounts();
        return ResponseEntity.noContent().build();
    }
}
package com.draxlmaier.assethub.module.employee.controller;

import com.draxlmaier.assethub.module.employee.dto.EmployeeRequestDTO;
import com.draxlmaier.assethub.module.employee.dto.EmployeeResponseDTO;
import com.draxlmaier.assethub.module.employee.service.EmployeeService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<EmployeeResponseDTO>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponseDTO> updateEmployee(@PathVariable UUID id, @RequestBody EmployeeRequestDTO request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EmployeeResponseDTO> toggleEmployeeStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.toggleEmployeeStatus(id));
    }

    // Endpoint modificat pentru a accepta generarea multiplă de conturi temporare
    @PostMapping("/generate-temp-account")
    public ResponseEntity<List<EmployeeResponseDTO>> generateTempAccounts(
            @RequestParam UUID departmentId,
            @RequestParam int count) {
        return ResponseEntity.ok(employeeService.generateEmployeeCodes(departmentId, count));
    }
}
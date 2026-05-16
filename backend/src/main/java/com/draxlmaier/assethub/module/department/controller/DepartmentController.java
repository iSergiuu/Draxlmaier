package com.draxlmaier.assethub.module.department.controller;

import com.draxlmaier.assethub.module.department.dto.DepartmentRequestDTO;
import com.draxlmaier.assethub.module.department.dto.DepartmentResponseDTO;
import com.draxlmaier.assethub.module.department.dto.DepartmentStatsDTO;
import com.draxlmaier.assethub.module.department.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<DepartmentResponseDTO>> getAllDepartments(){
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<DepartmentStatsDTO> getDepartmentStats(@PathVariable UUID id) {
        return ResponseEntity.ok(departmentService.getDepartmentStats(id));
    }

    // Endpoint pentru Creare (POST)
    @PostMapping
    public ResponseEntity<DepartmentResponseDTO> createDepartment(@Valid @RequestBody DepartmentRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.createDepartment(request));
    }

    // Endpoint pentru Editare (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponseDTO> updateDepartment(
            @PathVariable UUID id,
            @Valid @RequestBody DepartmentRequestDTO request) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, request));
    }

    // Endpoint pentru Ștergere (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable UUID id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build(); // Returnează un status 204 (Succes, fără continut)
    }
}
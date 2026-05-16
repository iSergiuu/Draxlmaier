package com.draxlmaier.assethub.module.department.controller;

import com.draxlmaier.assethub.module.department.dto.DepartmentResponseDTO;
import com.draxlmaier.assethub.module.department.dto.DepartmentStatsDTO;
import com.draxlmaier.assethub.module.department.service.DepartmentService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<DepartmentStatsDTO> getDepartmentStats(@PathVariable UUID id){
        return ResponseEntity.ok(departmentService.getDepartmentStats(id));
    }
}

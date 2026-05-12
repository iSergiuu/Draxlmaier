package com.draxlmaier.assethub.module.complaint.controller;

import com.draxlmaier.assethub.module.complaint.dto.request.ComplaintRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.request.StatusChangeRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.response.ComplaintResponseDTO;
import com.draxlmaier.assethub.module.complaint.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    // Oricine este logat (USER, DEPT_RESPONSIBLE, ADMIN) poate raporta o problemă
    @PostMapping
    public ResponseEntity<ComplaintResponseDTO> createComplaint(@Valid @RequestBody ComplaintRequestDTO requestDTO) {
        ComplaintResponseDTO response = complaintService.createComplaint(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Vizualizarea tuturor plângerilor (pentru administrare)
    @GetMapping
    public ResponseEntity<List<ComplaintResponseDTO>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    // Detaliile unei anumite plângeri
    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponseDTO> getComplaintById(@PathVariable UUID id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    // DOAR ADMIN și DEPT_RESPONSIBLE pot schimba statusul (ex: din NEW în IN_PROGRESS)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'DEPT_RESPONSIBLE', 'ROLE_DEPT_RESPONSIBLE')")
    public ResponseEntity<ComplaintResponseDTO> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusChangeRequestDTO statusDTO) {
        return ResponseEntity.ok(complaintService.updateStatus(id, statusDTO));
    }
}
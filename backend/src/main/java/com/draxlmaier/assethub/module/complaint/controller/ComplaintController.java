package com.draxlmaier.assethub.module.complaint.controller;

import com.draxlmaier.assethub.module.complaint.dto.CommentRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.ComplaintRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.WorkflowResponseDTO;
import com.draxlmaier.assethub.module.complaint.dto.StatusChangeRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.CommentResponseDTO;
import com.draxlmaier.assethub.module.complaint.dto.ComplaintResponseDTO;
import com.draxlmaier.assethub.module.complaint.service.CommentService;
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
    private final CommentService commentService;


    @PostMapping
    public ResponseEntity<ComplaintResponseDTO> createComplaint(@Valid @RequestBody ComplaintRequestDTO requestDTO) {
        ComplaintResponseDTO response = complaintService.createComplaint(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponseDTO>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/me")
    public ResponseEntity<List<ComplaintResponseDTO>> getMyComplaints() {
        return ResponseEntity.ok(complaintService.getMyComplaints());
    }

    @GetMapping("/global")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'DEPT_RESPONSIBLE', 'ROLE_DEPT_RESPONSIBLE')")
    public ResponseEntity<List<ComplaintResponseDTO>> getGlobalTickets() {
        return ResponseEntity.ok(complaintService.getGlobalTickets());
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'DEPT_RESPONSIBLE', 'ROLE_DEPT_RESPONSIBLE')")
    public ResponseEntity<List<ComplaintResponseDTO>> getMyAssignedTickets() {
        return ResponseEntity.ok(complaintService.getMyAssignedTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponseDTO> getComplaintById(@PathVariable UUID id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'DEPT_RESPONSIBLE', 'ROLE_DEPT_RESPONSIBLE')")
    public ResponseEntity<ComplaintResponseDTO> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusChangeRequestDTO statusDTO) {
        return ResponseEntity.ok(complaintService.updateStatus(id, statusDTO));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequestDTO requestDTO) {
        CommentResponseDTO response = commentService.addComment(id, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getCommentsByComplaintId(@PathVariable UUID id) {
        return ResponseEntity.ok(commentService.getCommentsByComplaintId(id));
    }

    @GetMapping("/{id}/workflow")
    public ResponseEntity<List<WorkflowResponseDTO>> getWorkflow(@PathVariable UUID id) {
        return ResponseEntity.ok(complaintService.getComplaintWorkflow(id));
    }
}
package com.draxlmaier.assethub.module.complaint.controller;

import com.draxlmaier.assethub.module.complaint.dto.FeedbackRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.FeedbackResponseDTO;
import com.draxlmaier.assethub.module.complaint.service.ComplaintFeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/complaints/{complaintId}/feedback")
@RequiredArgsConstructor
public class ComplaintFeedbackController {

    private final ComplaintFeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackResponseDTO> submitFeedback(
            @PathVariable UUID complaintId,
            @Valid @RequestBody FeedbackRequestDTO requestDTO) {
        FeedbackResponseDTO response = feedbackService.submitFeedback(complaintId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<FeedbackResponseDTO> getFeedback(@PathVariable UUID complaintId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByComplaintId(complaintId));
    }
}
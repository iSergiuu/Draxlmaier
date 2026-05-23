package com.draxlmaier.assethub.module.complaint.service;

import com.draxlmaier.assethub.module.complaint.dto.CommentRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.CommentResponseDTO;
import com.draxlmaier.assethub.module.complaint.model.Comment;
import com.draxlmaier.assethub.module.complaint.model.Complaint;
import com.draxlmaier.assethub.module.complaint.model.ComplaintWorkflow;
import com.draxlmaier.assethub.module.complaint.repository.CommentRepository;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintRepository;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintWorkflowRepository;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import com.draxlmaier.assethub.module.notification.service.NotificationManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final ComplaintRepository complaintRepository;
    private final EmployeeRepository employeeRepository;
    private final ComplaintWorkflowRepository workflowRepository;
    private final NotificationManagerService notificationManager; // Injectăm serviciul de notificări

    @Override
    @Transactional
    public CommentResponseDTO addComment(UUID complaintId, CommentRequestDTO requestDTO) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Plângerea nu a fost găsită"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));

        Comment comment = Comment.builder()
                .complaint(complaint)
                .author(currentUser)
                .message(requestDTO.message())
                .isInternal(requestDTO.isInternal())
                .createdAt(OffsetDateTime.now())
                .build();

        Comment savedComment = commentRepository.save(comment);

        ComplaintWorkflow workflowEntry = ComplaintWorkflow.builder()
                .complaint(complaint)
                .changedBy(currentUser)
                .oldStatus(complaint.getStatus())
                .newStatus(complaint.getStatus())
                .comment("Comentariu nou: " + (requestDTO.message().length() > 30
                        ? requestDTO.message().substring(0, 30) + "..."
                        : requestDTO.message()))
                .createdAt(OffsetDateTime.now())
                .build();
        workflowRepository.save(workflowEntry);

        if (!requestDTO.isInternal() && !currentUser.getId().equals(complaint.getAuthor().getId())) {
            String notificationMsg = currentUser.getFirstName() + " a lăsat un răspuns la problema ta: " + requestDTO.message();
            notificationManager.sendToUser(complaint.getAuthor(), "Răspuns nou la tichet", notificationMsg, complaint.getId());
        }

        return mapToResponseDTO(savedComment);
    }

    @Override
    public List<CommentResponseDTO> getCommentsByComplaintId(UUID complaintId) {
        return commentRepository.findAllByComplaintIdOrderByCreatedAtAsc(complaintId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private CommentResponseDTO mapToResponseDTO(Comment comment) {
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .message(comment.getMessage())
                .authorName(comment.getAuthor().getFirstName() + " " + comment.getAuthor().getLastName())
                .isInternal(comment.isInternal())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
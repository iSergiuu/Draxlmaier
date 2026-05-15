package com.draxlmaier.assethub.module.complaint.service;

import com.draxlmaier.assethub.module.complaint.dto.request.CommentRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.response.CommentResponseDTO;
import com.draxlmaier.assethub.module.complaint.model.Comment;
import com.draxlmaier.assethub.module.complaint.model.Complaint;
import com.draxlmaier.assethub.module.complaint.model.ComplaintWorkflow;
import com.draxlmaier.assethub.module.complaint.repository.CommentRepository;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintRepository;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintWorkflowRepository;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
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

    @Override
    @Transactional
    public CommentResponseDTO addComment(UUID complaintId, CommentRequestDTO requestDTO) {
        // 1. Găsim tichetul
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Plângerea nu a fost găsită"));

        // 2. Găsim autorul (cine e logat)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));

        // 3. Salvăm comentariul în tabelul lui
        Comment comment = Comment.builder()
                .complaint(complaint)
                .author(currentUser)
                .message(requestDTO.getMessage())
                .isInternal(requestDTO.isInternal())
                .createdAt(OffsetDateTime.now())
                .build();

        Comment savedComment = commentRepository.save(comment);

        // 4. SALVĂM ȘI ÎN WORKFLOW (ca să apară în timeline-ul general)
        ComplaintWorkflow workflowEntry = ComplaintWorkflow.builder()
                .complaint(complaint)
                .changedBy(currentUser)
                .oldStatus(complaint.getStatus()) // Statusul nu se schimbă
                .newStatus(complaint.getStatus()) // Rămâne același
                .comment("Comentariu nou: " + (requestDTO.getMessage().length() > 30
                        ? requestDTO.getMessage().substring(0, 30) + "..."
                        : requestDTO.getMessage()))
                .createdAt(OffsetDateTime.now())
                .build();
        workflowRepository.save(workflowEntry);

        return mapToResponseDTO(savedComment);
    }

    @Override
    public List<CommentResponseDTO> getCommentsByComplaintId(UUID complaintId) {
        return commentRepository.findAllByComplaintIdOrderByCreatedAtAsc(complaintId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // Metodă de mapare manuală (pentru a evita un mapper separat momentan)
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
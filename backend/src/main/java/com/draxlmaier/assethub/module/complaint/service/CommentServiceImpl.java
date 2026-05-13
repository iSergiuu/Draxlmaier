package com.draxlmaier.assethub.module.complaint.service;

import com.draxlmaier.assethub.module.complaint.dto.request.CommentRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.response.CommentResponseDTO;
import com.draxlmaier.assethub.module.complaint.mapper.CommentMapper;
import com.draxlmaier.assethub.module.complaint.model.Complaint;
import com.draxlmaier.assethub.module.complaint.model.ComplaintComment;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintCommentRepository;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintRepository;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final ComplaintCommentRepository commentRepository;
    private final ComplaintRepository complaintRepository;
    private final EmployeeRepository employeeRepository;
    private final CommentMapper commentMapper;

    @Override
    public CommentResponseDTO addComment(UUID complaintId, CommentRequestDTO requestDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee author = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Tichetul nu a fost găsit"));

        boolean isInternal = requestDTO.isInternal();
        if (author.getRole().getCode().equals("USER")) {
            isInternal = false;
        }

        ComplaintComment comment = commentMapper.toEntity(requestDTO);
        comment.setComplaint(complaint);
        comment.setAuthor(author);
        comment.setInternal(isInternal);
        comment.setCreatedAt(OffsetDateTime.now());

        ComplaintComment savedComment = commentRepository.save(comment);
        return commentMapper.toResponseDTO(savedComment);
    }

    @Override
    public List<CommentResponseDTO> getCommentsByComplaintId(UUID complaintId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email).get();

        boolean isAdminOrManager = currentUser.getRole().getCode().equals("ADMIN") ||
                currentUser.getRole().getCode().equals("DEPT_RESPONSIBLE");

        return commentRepository.findAllByComplaintIdOrderByCreatedAtAsc(complaintId)
                .stream()
                // Dacă e simplu angajat (USER), nu îi trimitem comentariile interne
                .filter(comment -> isAdminOrManager || !comment.isInternal())
                .map(commentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
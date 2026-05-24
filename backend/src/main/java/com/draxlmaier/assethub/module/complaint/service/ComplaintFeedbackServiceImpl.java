package com.draxlmaier.assethub.module.complaint.service;

import com.draxlmaier.assethub.core.exceptions.BusinessException;
import com.draxlmaier.assethub.module.complaint.dto.FeedbackRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.FeedbackResponseDTO;
import com.draxlmaier.assethub.module.complaint.model.Complaint;
import com.draxlmaier.assethub.module.complaint.model.ComplaintFeedback;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintFeedbackRepository;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintRepository;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintFeedbackServiceImpl implements ComplaintFeedbackService {

    private final ComplaintFeedbackRepository feedbackRepository;
    private final ComplaintRepository complaintRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public FeedbackResponseDTO submitFeedback(UUID complaintId, FeedbackRequestDTO requestDTO) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new BusinessException("Tichetul nu a fost găsit!"));

        if (!"CLOSED".equalsIgnoreCase(complaint.getStatus().getCode())) {
            throw new BusinessException("Poți lăsa feedback doar pentru tichetele care au fost rezolvate/închise!");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Utilizatorul nu a fost găsit!"));

        if (!complaint.getAuthor().getId().equals(currentUser.getId())) {
            throw new BusinessException("Doar autorul tichetului poate oferi feedback!");
        }

        if (feedbackRepository.existsByComplaintId(complaintId)) {
            throw new BusinessException("Ai oferit deja feedback pentru acest tichet!");
        }

        ComplaintFeedback feedback = ComplaintFeedback.builder()
                .complaint(complaint)
                .rating(requestDTO.rating())
                .comment(requestDTO.comment())
                .createdAt(OffsetDateTime.now())
                .build();

        ComplaintFeedback savedFeedback = feedbackRepository.save(feedback);

        return mapToDTO(savedFeedback);
    }

    @Override
    public FeedbackResponseDTO getFeedbackByComplaintId(UUID complaintId) {
        ComplaintFeedback feedback = feedbackRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new BusinessException("Acest tichet nu are încă un feedback!"));
        return mapToDTO(feedback);
    }

    private FeedbackResponseDTO mapToDTO(ComplaintFeedback feedback) {
        return new FeedbackResponseDTO(
                feedback.getId(),
                feedback.getComplaint().getId(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.getCreatedAt()
        );
    }
}
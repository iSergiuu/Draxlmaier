package com.draxlmaier.assethub.module.complaint.service;

import com.draxlmaier.assethub.module.asset.model.Asset;
import com.draxlmaier.assethub.module.asset.repository.AssetRepository;
import com.draxlmaier.assethub.module.complaint.dto.ComplaintRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.StatusChangeRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.ComplaintResponseDTO;
import com.draxlmaier.assethub.module.complaint.dto.WorkflowResponseDTO;
import com.draxlmaier.assethub.module.complaint.mapper.ComplaintMapper;
import com.draxlmaier.assethub.module.complaint.model.Complaint;
import com.draxlmaier.assethub.module.complaint.model.ComplaintStatus;
import com.draxlmaier.assethub.module.complaint.model.ComplaintWorkflow;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintRepository;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintStatusRepository;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintWorkflowRepository;
import com.draxlmaier.assethub.module.notification.service.EmailService;
import com.draxlmaier.assethub.module.notification.service.NotificationManagerService;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusRepository statusRepository;
    private final AssetRepository assetRepository;
    private final NotificationManagerService notificationManager;
    private final EmployeeRepository employeeRepository;
    private final ComplaintWorkflowRepository workflowRepository;
    private final ComplaintMapper complaintMapper;
    private final EntityManager entityManager;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    @Transactional
    public ComplaintResponseDTO createComplaint(ComplaintRequestDTO requestDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee author = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));

        ComplaintStatus initialStatus = statusRepository.findByCode("NEW")
                .orElseThrow(() -> new RuntimeException("Statusul NEW nu a fost găsit"));

        Asset asset = assetRepository.findById(requestDTO.assetId())
                .orElseThrow(() -> new RuntimeException("Echipamentul nu a fost găsit"));

        Complaint complaint = complaintMapper.toEntity(requestDTO);
        complaint.setAuthor(author);
        complaint.setAsset(asset);
        complaint.setStatus(initialStatus);
        complaint.setCreatedAt(OffsetDateTime.now());
        complaint.setEscalated(false);

        OffsetDateTime now = OffsetDateTime.now();
        String priority = (complaint.getPriority() != null) ? complaint.getPriority().toUpperCase() : "MEDIUM";

        switch (priority) {
            case "HIGH", "CRITICAL" -> complaint.setDueDate(now.plusHours(24));
            case "MEDIUM" -> complaint.setDueDate(now.plusDays(3));
            case "LOW" -> complaint.setDueDate(now.plusDays(5));
            default -> complaint.setDueDate(now.plusDays(7));
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        saveWorkflowStep(savedComplaint, author, null, initialStatus, "Tichet deschis automat.");

        String userMsg = "Tichetul tău '" + savedComplaint.getTitle() + "' a fost înregistrat cu succes. Te vom notifica pe parcurs ce acesta va fi procesat.";
        notificationManager.sendToUser(author, "Confirmare Creare Tichet", userMsg, savedComplaint.getId());

        return complaintMapper.toResponseDTO(savedComplaint);
    }

    @Override
    public ComplaintResponseDTO getComplaintById(UUID id) {
        return complaintRepository.findById(id)
                .map(complaintMapper::toResponseDTO)
                .orElseThrow(() -> new RuntimeException("Plângerea nu a fost găsită"));
    }

    @Override
    public List<ComplaintResponseDTO> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(complaintMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ComplaintResponseDTO updateStatus(UUID id, StatusChangeRequestDTO statusDTO) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plângerea nu a fost găsită"));

        ComplaintStatus oldStatus = complaint.getStatus();

        ComplaintStatus newStatus = statusRepository.findByCode(statusDTO.newStatusId())
                .orElseThrow(() -> new RuntimeException("Statusul nou selectat nu este valid"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul curent nu a fost găsit"));

        entityManager.createNativeQuery("SET LOCAL app.current_user_id = '" + currentUser.getId() + "'").executeUpdate();

        complaint.setStatus(newStatus);
        complaint.setUpdatedAt(OffsetDateTime.now());

        if ("IN_PROGRESS".equalsIgnoreCase(newStatus.getCode())) {
            complaint.setAssignedTo(currentUser);
        } else if ("IN_REVIEW".equalsIgnoreCase(newStatus.getCode()) || "NEW".equalsIgnoreCase(newStatus.getCode())) {
            complaint.setAssignedTo(null);
        }

        if (newStatus.isTerminal()) {
            complaint.setResolvedAt(OffsetDateTime.now());
        }

        if ("CLOSED".equalsIgnoreCase(newStatus.getCode())) {
            complaint.setDeletedAt(OffsetDateTime.now());
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        saveWorkflowStep(savedComplaint, currentUser, oldStatus, newStatus, statusDTO.comment());

        if (!savedComplaint.getAuthor().getId().equals(currentUser.getId())) {
            String userMsg = "Tichetul tău a fost trecut în statusul: " + newStatus.getCode() + ". Motiv: " + statusDTO.comment();
            notificationManager.sendToUser(savedComplaint.getAuthor(), "Status Tichet Actualizat", userMsg, savedComplaint.getId());

            if (newStatus.isTerminal()) {
                sendFeedbackEmail(savedComplaint);
            }
        }

        return complaintMapper.toResponseDTO(savedComplaint);
    }

    @Override
    public List<WorkflowResponseDTO> getComplaintWorkflow(UUID complaintId) {
        return workflowRepository.findAllByComplaintIdOrderByCreatedAtAsc(complaintId).stream()
                .map(w -> WorkflowResponseDTO.builder()
                        .changedBy(w.getChangedBy().getFirstName() + " " + w.getChangedBy().getLastName())
                        .oldStatus(w.getOldStatus() != null ? w.getOldStatus().getCode() : "N/A")
                        .newStatus(w.getNewStatus().getCode())
                        .comment(w.getComment() != null ? w.getComment() : "Fără comentarii")
                        .createdAt(w.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplaintResponseDTO> getMyComplaints() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return complaintRepository.findAllByAuthorEmail(email).stream()
                .map(complaintMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplaintResponseDTO> getGlobalTickets() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul curent nu a fost găsit"));

        List<String> validStatuses = Arrays.asList("NEW", "IN_REVIEW");

        return complaintRepository.findByAuthorIdNotAndAssignedToIsNullAndStatus_CodeInAndDeletedAtIsNull(
                        currentUser.getId(), validStatuses).stream()
                .map(complaintMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplaintResponseDTO> getMyAssignedTickets() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul curent nu a fost găsit"));

        List<String> validStatuses = Arrays.asList("IN_PROGRESS");

        return complaintRepository.findByAssignedToIdAndStatus_CodeInAndDeletedAtIsNull(
                        currentUser.getId(), validStatuses).stream()
                .map(complaintMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    private void saveWorkflowStep(Complaint complaint, Employee user, ComplaintStatus oldStatus, ComplaintStatus newStatus, String comment) {
        ComplaintWorkflow workflow = ComplaintWorkflow.builder()
                .complaint(complaint)
                .changedBy(user)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .comment(comment)
                .createdAt(OffsetDateTime.now())
                .build();
        workflowRepository.save(workflow);
    }

    private void sendFeedbackEmail(Complaint complaint) {
        String authorEmail = complaint.getAuthor().getEmail();

        if (authorEmail == null || authorEmail.isEmpty()) {
            return;
        }

        String feedbackLink = frontendUrl + "/feedback/" + complaint.getId();
        String subject = "AssetHub: Spune-ne părerea ta despre tichetul rezolvat!";

        String emailBody = "Salut " + complaint.getAuthor().getFirstName() + ",\n\n"
                + "Tichetul tău '" + complaint.getTitle() + "' a fost proaspăt închis.\n\n"
                + "Ne-ar ajuta foarte mult să știm cum a fost experiența ta cu echipa de suport. Te rugăm să ne lași o scurtă evaluare accesând link-ul de mai jos:\n\n"
                + feedbackLink + "\n\n"
                + "Părerea ta ne ajută să ne îmbunătățim mereu serviciile.\n\n"
                + "O zi excelentă,\n"
                + "Echipa AssetHub";

        try {
            emailService.sendEmail(authorEmail, subject, emailBody);
        } catch (Exception e) {
            System.out.println("Nu s-a putut trimite email-ul de feedback către: " + authorEmail);
        }
    }
}
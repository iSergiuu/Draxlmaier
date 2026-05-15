package com.draxlmaier.assethub.module.complaint.service;

import com.draxlmaier.assethub.module.asset.model.Asset;
import com.draxlmaier.assethub.module.asset.repository.AssetRepository;
import com.draxlmaier.assethub.module.complaint.dto.request.ComplaintRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.request.StatusChangeRequestDTO;
import com.draxlmaier.assethub.module.complaint.dto.response.ComplaintResponseDTO;
import com.draxlmaier.assethub.module.complaint.dto.response.WorkflowResponseDTO;
import com.draxlmaier.assethub.module.complaint.mapper.ComplaintMapper;
import com.draxlmaier.assethub.module.complaint.model.Complaint;
import com.draxlmaier.assethub.module.complaint.model.ComplaintStatus;
import com.draxlmaier.assethub.module.complaint.model.ComplaintWorkflow;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintRepository;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintStatusRepository;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintWorkflowRepository;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityManager;
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
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusRepository statusRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final ComplaintWorkflowRepository workflowRepository;
    private final ComplaintMapper complaintMapper;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public ComplaintResponseDTO createComplaint(ComplaintRequestDTO requestDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee author = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul logat nu a fost găsit"));

        Asset asset = assetRepository.findById(requestDTO.getAssetId())
                .orElseThrow(() -> new RuntimeException("Asset-ul nu a fost găsit"));

        ComplaintStatus initialStatus = statusRepository.findByCode("NEW")
                .orElseThrow(() -> new RuntimeException("Statusul NEW nu există în baza de date"));

        Complaint complaint = complaintMapper.toEntity(requestDTO);
        complaint.setAuthor(author);
        complaint.setAsset(asset);
        complaint.setStatus(initialStatus);
        complaint.setCreatedAt(OffsetDateTime.now());

        Complaint savedComplaint = complaintRepository.save(complaint);

        saveWorkflowStep(savedComplaint, author, null, initialStatus, "Tichet deschis");

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

        ComplaintStatus newStatus = statusRepository.findById(statusDTO.getNewStatusId())
                .orElseThrow(() -> new RuntimeException("Statusul nou selectat nu este valid"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul curent nu a fost găsit"));

        entityManager.createNativeQuery("SET LOCAL app.current_user_id = '" + currentUser.getId() + "'").executeUpdate();

        complaint.setStatus(newStatus);
        complaint.setUpdatedAt(OffsetDateTime.now());

        if (newStatus.isTerminal()) {
            complaint.setResolvedAt(OffsetDateTime.now());
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        saveWorkflowStep(savedComplaint, currentUser, oldStatus, newStatus, statusDTO.getComment());

        return complaintMapper.toResponseDTO(savedComplaint);
    }

    @Override
    public List<WorkflowResponseDTO> getComplaintWorkflow(UUID complaintId) {
        // Returnează tot istoricul pentru timeline-ul din frontend
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
}
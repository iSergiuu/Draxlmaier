package com.draxlmaier.assethub.module.complaint.job;

import com.draxlmaier.assethub.module.complaint.model.Complaint;
import com.draxlmaier.assethub.module.complaint.model.ComplaintWorkflow;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintRepository;
import com.draxlmaier.assethub.module.complaint.repository.ComplaintWorkflowRepository;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SLAEnforcementJob {

    private final ComplaintRepository complaintRepository;
    private final ComplaintWorkflowRepository workflowRepository;

    private final EmployeeRepository employeeRepository;

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void enforceSLA() {
        OffsetDateTime threshold = OffsetDateTime.now().minusHours(24);
        List<Complaint> complaints = complaintRepository.findAll();

        for (Complaint complaint : complaints) {
            if (complaint.getStatus() != null && !complaint.getStatus().isTerminal() && !complaint.isEscalated()) {

                OffsetDateTime lastTouch = complaint.getUpdatedAt() != null ? complaint.getUpdatedAt() : complaint.getCreatedAt();

                if (lastTouch != null && lastTouch.isBefore(threshold)) {

                    Employee systemAdmin = employeeRepository.findByEmail("admin@draxlmaier.com")
                            .orElse(complaint.getAuthor());

                    complaint.setPriority("CRITICAL");
                    complaint.setEscalated(true);
                    complaint.setUpdatedAt(OffsetDateTime.now());

                    complaintRepository.save(complaint);

                    ComplaintWorkflow workflowEntry = ComplaintWorkflow.builder()
                            .complaint(complaint)
                            .changedBy(systemAdmin)
                            .oldStatus(complaint.getStatus())
                            .newStatus(complaint.getStatus())
                            .comment("Escaladare Automată: Tichetul a fost inactiv în ultimele 24 de ore. Prioritatea a fost ridicată la CRITICAL.")
                            .createdAt(OffsetDateTime.now())
                            .build();

                    workflowRepository.save(workflowEntry);

                    System.out.println("Tichetul cu ID-ul " + complaint.getId() + " a fost escaladat automat la CRITICAL.");
                }
            }
        }
    }
}
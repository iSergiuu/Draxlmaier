package com.draxlmaier.assethub.module.complaint.event;

import com.draxlmaier.assethub.module.complaint.model.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ComplaintStatusChangedEvent {
    private final Long complaintId;
    private final ComplaintStatus oldStatus;
    private final ComplaintStatus newStatus;
    private final String employeeEmail;
}

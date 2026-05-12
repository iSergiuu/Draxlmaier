package com.draxlmaier.assethub.module.complaint.event;

import com.draxlmaier.assethub.module.complaint.model.Complaint;
import com.draxlmaier.assethub.module.complaint.model.ComplaintStatus;
import com.draxlmaier.assethub.module.employee.model.Employee;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ComplaintStatusChangedEvent {

    private final Complaint complaint;
    private final ComplaintStatus oldStatus;
    private final ComplaintStatus newStatus;
    private final Employee changedBy;
    private final String comment;
}
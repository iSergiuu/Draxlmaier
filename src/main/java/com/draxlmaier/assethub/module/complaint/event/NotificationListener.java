package com.draxlmaier.assethub.module.complaint.event;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {

    @EventListener
    public void handleComplaintStatusChange(ComplaintStatusChangedEvent event) {
        System.out.println("\n=====================================================");
        System.out.println("📧 NOTIFICARE NOUĂ (SIMULARE E-MAIL)");
        System.out.println("Către: " + event.getEmployeeEmail());
        System.out.println("Subiect: Statusul plângerii #" + event.getComplaintId() + " a fost actualizat");
        System.out.println("Mesaj: Statusul a fost schimbat din " + event.getOldStatus() + " în " + event.getNewStatus() + ".");
        System.out.println("=====================================================\n");
    }
}
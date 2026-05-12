package com.draxlmaier.assethub.module.complaint.event;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {

    @EventListener
    public void handleComplaintStatusChange(ComplaintStatusChangedEvent event) {
        String employeeEmail = event.getComplaint().getAuthor().getEmail();

        String ticketNumber = String.valueOf(event.getComplaint().getTicketNumber());

        String oldStatus = event.getOldStatus() != null ? event.getOldStatus().getCode() : "N/A";
        String newStatus = event.getNewStatus().getCode();

        System.out.println("\n=====================================================");
        System.out.println("📧 NOTIFICARE NOUĂ (SIMULARE E-MAIL)");
        System.out.println("Către: " + employeeEmail);
        System.out.println("Subiect: Statusul plângerii #" + ticketNumber + " a fost actualizat");
        System.out.println("Mesaj: Statusul a fost schimbat din " + oldStatus + " în " + newStatus + ".");
        System.out.println("=====================================================\n");
    }
}
package com.draxlmaier.assethub.module.notification.service;

import com.draxlmaier.assethub.module.notification.model.Notification;
import com.draxlmaier.assethub.module.notification.repository.NotificationRepository;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationManagerService {

    private final NotificationRepository notificationRepository;
    private final EmployeeRepository employeeRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    public void sendToUser(Employee recipient, String title, String messageText, UUID referenceId) {
        Notification notification = Notification.builder()
                .user(recipient)
                .title(title)
                .message(messageText)
                .read(false)
                .referenceId(referenceId)
                .createdAt(OffsetDateTime.now())
                .build();

        notificationRepository.save(notification);

        String channel = "/topic/notifications/" + recipient.getId();
        messagingTemplate.convertAndSend(channel, notification);

        if (recipient.getEmail() != null && !recipient.getEmail().isEmpty()) {
            try {
                String emailBody = "Salut " + recipient.getFirstName() + ",\n\n" + messageText + "\n\nO zi buna,\nEchipa AssetHub";
                emailService.sendEmail(recipient.getEmail(), "AssetHub: " + title, emailBody);
            } catch (Exception e) {
                System.out.println("Eroare la trimiterea emailului catre: " + recipient.getEmail());
            }
        }
    }

    public void sendToAllAdmins(String title, String messageText, UUID referenceId) {
        List<Employee> admins = employeeRepository.findAllByRoleCode("ADMIN");
        for (Employee admin : admins) {
            sendToUser(admin, title, messageText, referenceId);
        }
    }
}
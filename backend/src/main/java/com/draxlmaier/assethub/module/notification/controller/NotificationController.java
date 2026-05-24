package com.draxlmaier.assethub.module.notification.controller;

import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import com.draxlmaier.assethub.module.notification.dto.NotificationDTO;
import com.draxlmaier.assethub.module.notification.model.Notification;
import com.draxlmaier.assethub.module.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email).orElseThrow();

        List<NotificationDTO> notifications = notificationRepository
                .findAllByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(n -> NotificationDTO.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .read(n.isRead())
                        .referenceId(n.getReferenceId())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email).orElseThrow();

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificarea nu a fost gasita"));

        if (notification.getUser().getId().equals(currentUser.getId())) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }

        return ResponseEntity.ok().build();
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email).orElseThrow();

        List<Notification> unreadNotifications = notificationRepository.findAllByUserIdAndReadFalse(currentUser.getId());
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email).orElseThrow();

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificarea nu a fost găsită"));

        if (notification.getUser().getId().equals(currentUser.getId())) {
            notificationRepository.delete(notification);
        }

        return ResponseEntity.noContent().build(); // Status 204 No Content
    }

    @DeleteMapping("/clear-all")
    @Transactional
    public ResponseEntity<Void> clearAllNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentUser = employeeRepository.findByEmail(email).orElseThrow();

        notificationRepository.deleteAllByUserId(currentUser.getId());

        return ResponseEntity.noContent().build(); // Status 204 No Content
    }
}
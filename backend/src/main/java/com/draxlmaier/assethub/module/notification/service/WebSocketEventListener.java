package com.draxlmaier.assethub.module.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final UserSessionRegistry sessionRegistry;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = event.getUser();

        if (user != null && user.getName() != null) {
            String email = user.getName();
            String sessionId = headerAccessor.getSessionId();
            sessionRegistry.addSession(sessionId, email);
            System.out.println("User online: " + email + " (Sesiune: " + sessionId + ")");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        sessionRegistry.removeSession(sessionId);
        System.out.println("Sesiune închisă: " + sessionId);
    }
}
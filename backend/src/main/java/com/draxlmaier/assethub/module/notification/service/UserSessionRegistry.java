package com.draxlmaier.assethub.module.notification.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserSessionRegistry {

    private final ConcurrentHashMap<String, String> activeSessions = new ConcurrentHashMap<>();

    public void addSession(String sessionId, String email){
        if(email != null && !email.isBlank())
            activeSessions.put(sessionId, email);
    }

    public void removeSession(String sessionId){
        activeSessions.remove(sessionId);
    }

    public boolean isOnline(String email){
        return activeSessions.containsValue(email);
    }
}

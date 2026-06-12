package com.hms.controller;

import com.hms.dto.NotificationDTO;
import com.hms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> sendNotification(@RequestBody NotificationDTO notificationDTO) {
        try {
            NotificationDTO sentNotification = notificationService.sendNotification(notificationDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(sentNotification);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<?> getNotificationById(@PathVariable Long id) {
        try {
            NotificationDTO notification = notificationService.getNotificationById(id);
            return ResponseEntity.ok(notification);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<?> getNotificationsByUser(@PathVariable Long userId) {
        try {
            List<NotificationDTO> notifications = notificationService.getNotificationsByUser(userId);
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getNotificationsByStatus(@PathVariable String status) {
        try {
            List<NotificationDTO> notifications = notificationService.getNotificationsByStatus(status);
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getNotificationsByType(@PathVariable String type) {
        try {
            List<NotificationDTO> notifications = notificationService.getNotificationsByType(type);
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllNotifications() {
        List<NotificationDTO> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(notifications);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Notification deleted successfully");
            }});
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
}

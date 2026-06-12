package com.hms.service;

import com.hms.dto.NotificationDTO;
import com.hms.entity.Notification;
import com.hms.entity.User;
import com.hms.repository.NotificationRepository;
import com.hms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    public NotificationDTO sendNotification(NotificationDTO notificationDTO) {
        Optional<User> userOpt = userRepository.findById(notificationDTO.getUserId());
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        
        Notification notification = Notification.builder()
                .user(user)
                .type(notificationDTO.getType())
                .subject(notificationDTO.getSubject())
                .message(notificationDTO.getMessage())
                .recipientEmail(notificationDTO.getRecipientEmail() != null ? notificationDTO.getRecipientEmail() : user.getEmail())
                .recipientPhone(notificationDTO.getRecipientPhone())
                .status("PENDING")
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);
        
        // Send notification based on type
        sendNotificationByType(savedNotification);
        
        return mapToDTO(savedNotification);
    }
    
    public void sendNotificationByType(Notification notification) {
        try {
            if ("EMAIL".equals(notification.getType())) {
                emailService.sendEmail(notification.getRecipientEmail(), notification.getSubject(), notification.getMessage());
                notification.setStatus("SENT");
            } else if ("SMS".equals(notification.getType())) {
                // SMS sending logic (placeholder)
                // In production, integrate with SMS service like Twilio
                notification.setStatus("SENT");
            } else if ("IN_APP".equals(notification.getType())) {
                notification.setStatus("SENT");
            }
        } catch (Exception e) {
            notification.setStatus("FAILED");
            notification.setErrorMessage(e.getMessage());
        }
        
        notificationRepository.save(notification);
    }
    
    public NotificationDTO getNotificationById(Long id) {
        Optional<Notification> notificationOpt = notificationRepository.findById(id);
        if (!notificationOpt.isPresent()) {
            throw new RuntimeException("Notification not found");
        }
        return mapToDTO(notificationOpt.get());
    }
    
    public List<NotificationDTO> getNotificationsByUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        return notificationRepository.findByUser(userOpt.get())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<NotificationDTO> getNotificationsByStatus(String status) {
        return notificationRepository.findByStatus(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<NotificationDTO> getNotificationsByType(String type) {
        return notificationRepository.findByType(type)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<NotificationDTO> getAllNotifications() {
        return notificationRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public void deleteNotification(Long id) {
        Optional<Notification> notificationOpt = notificationRepository.findById(id);
        if (!notificationOpt.isPresent()) {
            throw new RuntimeException("Notification not found");
        }
        
        notificationRepository.deleteById(id);
    }
    
    private NotificationDTO mapToDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getUser().getId(),
                notification.getUser().getName(),
                notification.getType(),
                notification.getSubject(),
                notification.getMessage(),
                notification.getRecipientEmail(),
                notification.getRecipientPhone(),
                notification.getStatus(),
                notification.getErrorMessage(),
                notification.getCreatedAt()
        );
    }
}

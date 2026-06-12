package com.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String type;
    private String subject;
    private String message;
    private String recipientEmail;
    private String recipientPhone;
    private String status;
    private String errorMessage;
    private LocalDateTime createdAt;
}

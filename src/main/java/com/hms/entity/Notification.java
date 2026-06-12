package com.hms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(length = 50, nullable = false)
    private String type; // EMAIL, SMS, IN_APP
    
    @Column(length = 100, nullable = false)
    private String subject;
    
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String message;
    
    @Column(length = 100)
    private String recipientEmail;
    
    @Column(length = 20)
    private String recipientPhone;
    
    @Column(length = 20)
    private String status; // PENDING, SENT, FAILED
    
    @Column(columnDefinition = "LONGTEXT")
    private String errorMessage;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

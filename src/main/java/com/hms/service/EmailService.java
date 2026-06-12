package com.hms.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    public void sendEmail(String to, String subject, String message) {
        if (mailSender == null) {
            // Fallback: just log the email (for development without mail server)
            System.out.println("Email Service not configured. Email details:");
            System.out.println("To: " + to);
            System.out.println("Subject: " + subject);
            System.out.println("Message: " + message);
            return;
        }
        
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);
            mailMessage.setFrom("noreply@hospitalmanagement.com");
            
            mailSender.send(mailMessage);
        } catch (Exception e) {
            System.out.println("Error sending email: " + e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}

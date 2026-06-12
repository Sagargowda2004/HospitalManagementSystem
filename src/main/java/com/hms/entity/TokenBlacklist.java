package com.hms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "token_blacklist")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenBlacklist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String token;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private LocalDateTime blacklistedAt;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    public TokenBlacklist(String token, String email, LocalDateTime expiresAt) {
        this.token = token;
        this.email = email;
        this.blacklistedAt = LocalDateTime.now();
        this.expiresAt = expiresAt;
    }
}

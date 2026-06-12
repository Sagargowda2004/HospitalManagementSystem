package com.hms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;
    
    @Column(nullable = false)
    private BigDecimal amount;
    
    @Column(length = 50)
    private String paymentMethod; // CASH, CARD, BANK_TRANSFER, CHEQUE, UPI
    
    @Column(length = 100)
    private String transactionId;
    
    @Column(length = 20)
    private String status; // PENDING, COMPLETED, FAILED
    
    @Column(length = 500)
    private String remarks;
    
    @Column(nullable = false)
    private LocalDateTime paymentDate = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

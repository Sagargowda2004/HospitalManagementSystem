package com.hms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;
    
    @Column(nullable = false, length = 50)
    private String billNumber;
    
    @Column(nullable = false)
    private BigDecimal consultationCharges;
    
    @Column(nullable = false)
    private BigDecimal medicineCharges;
    
    @Column(nullable = false)
    private BigDecimal testCharges;
    
    @Column(nullable = false)
    private BigDecimal otherCharges;
    
    @Column(nullable = false)
    private BigDecimal totalAmount;
    
    @Column(nullable = false)
    private BigDecimal paidAmount = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private BigDecimal balanceAmount;
    
    @Column(length = 20)
    private String status; // PENDING, PARTIAL, PAID, CANCELLED
    
    @Column(length = 500)
    private String notes;
    
    @Column(nullable = false)
    private LocalDateTime billDate = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.balanceAmount = this.totalAmount.subtract(this.paidAmount);
    }
    
    @PrePersist
    public void prePersist() {
        this.totalAmount = this.consultationCharges
                .add(this.medicineCharges)
                .add(this.testCharges)
                .add(this.otherCharges);
        this.balanceAmount = this.totalAmount.subtract(this.paidAmount);
    }
}

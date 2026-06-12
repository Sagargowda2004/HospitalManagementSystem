package com.hms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private DoctorProfile doctor;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medical_record_id")
    private MedicalRecord medicalRecord;
    
    @Column(length = 100, nullable = false)
    private String medicineName;
    
    @Column(length = 50)
    private String dosage;
    
    @Column(length = 50)
    private String frequency;
    
    @Column(length = 50)
    private String duration;
    
    @Column(columnDefinition = "LONGTEXT")
    private String instructions;
    
    @Column(length = 20)
    private String status; // ACTIVE, COMPLETED, CANCELLED
    
    @Column(nullable = false)
    private LocalDateTime prescribedDate = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

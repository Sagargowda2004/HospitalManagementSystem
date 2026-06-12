package com.hms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord {
    
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
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    
    @Column(columnDefinition = "LONGTEXT")
    private String diagnosis;
    
    @Column(columnDefinition = "LONGTEXT")
    private String treatment;
    
    @Column(columnDefinition = "LONGTEXT")
    private String notes;
    
    @Column(length = 50)
    private String bloodPressure;
    
    @Column(length = 50)
    private String temperature;
    
    @Column(length = 50)
    private String heartRate;
    
    @Column(length = 50)
    private String weight;
    
    @Column(length = 50)
    private String height;
    
    @Column(nullable = false)
    private LocalDateTime recordDate = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

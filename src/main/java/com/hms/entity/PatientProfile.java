package com.hms.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "patient_profile")
public class PatientProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    private int age;

    private String gender;

    private String address;

    private String phone;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private DoctorProfile assignedDoctor;
}
package com.hms.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "doctor_profile")
public class DoctorProfile {

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

    private String specialization;

    private int experience;

    private String availability; // e.g., 10 AM - 5 PM
}
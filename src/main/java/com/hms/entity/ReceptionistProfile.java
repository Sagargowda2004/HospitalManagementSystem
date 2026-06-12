package com.hms.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "receptionist_profile")
public class ReceptionistProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String shift; // morning, evening
}

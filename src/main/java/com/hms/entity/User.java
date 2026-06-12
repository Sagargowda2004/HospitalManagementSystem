package com.hms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")  // avoid reserved word "user"
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    // ADMIN / DOCTOR / PATIENT / RECEPTIONIST
    private String role;
}

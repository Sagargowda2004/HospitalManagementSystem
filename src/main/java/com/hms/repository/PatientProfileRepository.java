package com.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.hms.entity.PatientProfile;

import java.util.Optional;

public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {
    Optional<PatientProfile> findByUserEmail(String email);
}

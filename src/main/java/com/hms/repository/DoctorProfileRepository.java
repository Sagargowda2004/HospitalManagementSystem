package com.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.hms.entity.DoctorProfile;

import java.util.Optional;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
    Optional<DoctorProfile> findByUserEmail(String email);
}

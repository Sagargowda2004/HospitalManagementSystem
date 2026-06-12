package com.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.hms.entity.ReceptionistProfile;

public interface ReceptionistProfileRepository extends JpaRepository<ReceptionistProfile, Long> {
}

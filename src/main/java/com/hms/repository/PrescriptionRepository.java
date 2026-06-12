package com.hms.repository;

import com.hms.entity.Prescription;
import com.hms.entity.PatientProfile;
import com.hms.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    
    List<Prescription> findByPatient(PatientProfile patient);
    
    List<Prescription> findByDoctor(DoctorProfile doctor);
    
    List<Prescription> findByStatus(String status);
    
    List<Prescription> findByPatientAndStatus(PatientProfile patient, String status);
}

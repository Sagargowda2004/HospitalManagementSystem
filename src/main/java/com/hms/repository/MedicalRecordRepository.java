package com.hms.repository;

import com.hms.entity.MedicalRecord;
import com.hms.entity.PatientProfile;
import com.hms.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    
    List<MedicalRecord> findByPatient(PatientProfile patient);
    
    List<MedicalRecord> findByDoctor(DoctorProfile doctor);
    
    List<MedicalRecord> findByPatientAndRecordDateBetween(PatientProfile patient, LocalDateTime start, LocalDateTime end);
    
    List<MedicalRecord> findByRecordDateBetween(LocalDateTime start, LocalDateTime end);
}

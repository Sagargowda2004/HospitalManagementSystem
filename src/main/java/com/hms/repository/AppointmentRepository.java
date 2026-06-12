package com.hms.repository;

import com.hms.entity.Appointment;
import com.hms.entity.PatientProfile;
import com.hms.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByPatient(PatientProfile patient);
    
    List<Appointment> findByDoctor(DoctorProfile doctor);
    
    List<Appointment> findByStatus(String status);
    
    List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end);
    
    List<Appointment> findByPatientAndStatus(PatientProfile patient, String status);
    
    List<Appointment> findByDoctorAndStatus(DoctorProfile doctor, String status);
}

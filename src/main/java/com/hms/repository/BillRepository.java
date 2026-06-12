package com.hms.repository;

import com.hms.entity.Bill;
import com.hms.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    
    List<Bill> findByPatient(PatientProfile patient);
    
    List<Bill> findByStatus(String status);
    
    List<Bill> findByPatientAndStatus(PatientProfile patient, String status);
    
    List<Bill> findByBillDateBetween(LocalDateTime start, LocalDateTime end);
    
    Optional<Bill> findByBillNumber(String billNumber);
}

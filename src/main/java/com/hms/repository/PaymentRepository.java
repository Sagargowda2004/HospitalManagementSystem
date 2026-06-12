package com.hms.repository;

import com.hms.entity.Payment;
import com.hms.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByBill(Bill bill);
    
    List<Payment> findByStatus(String status);
    
    List<Payment> findByPaymentDateBetween(LocalDateTime start, LocalDateTime end);
}

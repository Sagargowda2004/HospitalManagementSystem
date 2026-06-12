package com.hms.service;

import com.hms.dto.PaymentDTO;
import com.hms.entity.Payment;
import com.hms.entity.Bill;
import com.hms.repository.PaymentRepository;
import com.hms.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private BillRepository billRepository;
    
    @Autowired
    private BillService billService;
    
    public PaymentDTO createPayment(PaymentDTO paymentDTO) {
        Optional<Bill> billOpt = billRepository.findById(paymentDTO.getBillId());
        if (!billOpt.isPresent()) {
            throw new RuntimeException("Bill not found");
        }
        
        Bill bill = billOpt.get();
        
        Payment payment = Payment.builder()
                .bill(bill)
                .amount(paymentDTO.getAmount())
                .paymentMethod(paymentDTO.getPaymentMethod())
                .transactionId(paymentDTO.getTransactionId())
                .status("COMPLETED")
                .remarks(paymentDTO.getRemarks())
                .build();
        
        Payment savedPayment = paymentRepository.save(payment);
        
        // Update bill paid amount and status
        bill.setPaidAmount(bill.getPaidAmount().add(paymentDTO.getAmount()));
        
        if (bill.getPaidAmount().compareTo(bill.getTotalAmount()) >= 0) {
            bill.setStatus("PAID");
        } else if (bill.getPaidAmount().compareTo(bill.getTotalAmount()) > 0) {
            bill.setStatus("PARTIAL");
        }
        
        billRepository.save(bill);
        
        return mapToDTO(savedPayment);
    }
    
    public PaymentDTO getPaymentById(Long id) {
        Optional<Payment> paymentOpt = paymentRepository.findById(id);
        if (!paymentOpt.isPresent()) {
            throw new RuntimeException("Payment not found");
        }
        return mapToDTO(paymentOpt.get());
    }
    
    public List<PaymentDTO> getPaymentsByBill(Long billId) {
        Optional<Bill> billOpt = billRepository.findById(billId);
        if (!billOpt.isPresent()) {
            throw new RuntimeException("Bill not found");
        }
        
        return paymentRepository.findByBill(billOpt.get())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PaymentDTO> getPaymentsByStatus(String status) {
        return paymentRepository.findByStatus(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public void deletePayment(Long id) {
        Optional<Payment> paymentOpt = paymentRepository.findById(id);
        if (!paymentOpt.isPresent()) {
            throw new RuntimeException("Payment not found");
        }
        
        paymentRepository.deleteById(id);
    }
    
    private PaymentDTO mapToDTO(Payment payment) {
        return new PaymentDTO(
                payment.getId(),
                payment.getBill().getId(),
                payment.getBill().getBillNumber(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getTransactionId(),
                payment.getStatus(),
                payment.getRemarks(),
                payment.getPaymentDate()
        );
    }
}

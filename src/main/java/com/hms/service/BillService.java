package com.hms.service;

import com.hms.dto.BillDTO;
import com.hms.entity.Bill;
import com.hms.entity.PatientProfile;
import com.hms.repository.BillRepository;
import com.hms.repository.PatientProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BillService {
    
    @Autowired
    private BillRepository billRepository;
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    
    public BillDTO createBill(BillDTO billDTO) {
        Optional<PatientProfile> patientOpt = patientProfileRepository.findById(billDTO.getPatientId());
        if (!patientOpt.isPresent()) {
            throw new RuntimeException("Patient not found");
        }
        
        // Generate bill number
        String billNumber = "BILL-" + System.currentTimeMillis();
        
        Bill bill = Bill.builder()
                .patient(patientOpt.get())
                .billNumber(billNumber)
                .consultationCharges(billDTO.getConsultationCharges() != null ? billDTO.getConsultationCharges() : BigDecimal.ZERO)
                .medicineCharges(billDTO.getMedicineCharges() != null ? billDTO.getMedicineCharges() : BigDecimal.ZERO)
                .testCharges(billDTO.getTestCharges() != null ? billDTO.getTestCharges() : BigDecimal.ZERO)
                .otherCharges(billDTO.getOtherCharges() != null ? billDTO.getOtherCharges() : BigDecimal.ZERO)
                .paidAmount(BigDecimal.ZERO)
                .status("PENDING")
                .notes(billDTO.getNotes())
                .build();
        
        Bill savedBill = billRepository.save(bill);
        return mapToDTO(savedBill);
    }
    
    public BillDTO updateBill(Long id, BillDTO billDTO) {
        Optional<Bill> billOpt = billRepository.findById(id);
        if (!billOpt.isPresent()) {
            throw new RuntimeException("Bill not found");
        }
        
        Bill bill = billOpt.get();
        
        if (billDTO.getConsultationCharges() != null) {
            bill.setConsultationCharges(billDTO.getConsultationCharges());
        }
        if (billDTO.getMedicineCharges() != null) {
            bill.setMedicineCharges(billDTO.getMedicineCharges());
        }
        if (billDTO.getTestCharges() != null) {
            bill.setTestCharges(billDTO.getTestCharges());
        }
        if (billDTO.getOtherCharges() != null) {
            bill.setOtherCharges(billDTO.getOtherCharges());
        }
        if (billDTO.getNotes() != null) {
            bill.setNotes(billDTO.getNotes());
        }
        
        Bill updatedBill = billRepository.save(bill);
        return mapToDTO(updatedBill);
    }
    
    public BillDTO getBillById(Long id) {
        Optional<Bill> billOpt = billRepository.findById(id);
        if (!billOpt.isPresent()) {
            throw new RuntimeException("Bill not found");
        }
        return mapToDTO(billOpt.get());
    }
    
    public List<BillDTO> getBillsByPatient(Long patientId) {
        Optional<PatientProfile> patientOpt = patientProfileRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            throw new RuntimeException("Patient not found");
        }
        
        return billRepository.findByPatient(patientOpt.get())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<BillDTO> getBillsByStatus(String status) {
        return billRepository.findByStatus(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<BillDTO> getAllBills() {
        return billRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public void deleteBill(Long id) {
        Optional<Bill> billOpt = billRepository.findById(id);
        if (!billOpt.isPresent()) {
            throw new RuntimeException("Bill not found");
        }
        
        billRepository.deleteById(id);
    }
    
    public BillDTO updateBillStatus(Long id, String status) {
        Optional<Bill> billOpt = billRepository.findById(id);
        if (!billOpt.isPresent()) {
            throw new RuntimeException("Bill not found");
        }
        
        Bill bill = billOpt.get();
        bill.setStatus(status);
        
        Bill updatedBill = billRepository.save(bill);
        return mapToDTO(updatedBill);
    }
    
    private BillDTO mapToDTO(Bill bill) {
        return new BillDTO(
                bill.getId(),
                bill.getPatient().getId(),
                bill.getPatient().getUser().getName(),
                bill.getBillNumber(),
                bill.getConsultationCharges(),
                bill.getMedicineCharges(),
                bill.getTestCharges(),
                bill.getOtherCharges(),
                bill.getTotalAmount(),
                bill.getPaidAmount(),
                bill.getBalanceAmount(),
                bill.getStatus(),
                bill.getNotes(),
                bill.getBillDate()
        );
    }
}

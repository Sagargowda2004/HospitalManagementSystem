package com.hms.controller;

import com.hms.dto.BillDTO;
import com.hms.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {
    
    @Autowired
    private BillService billService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createBill(@RequestBody BillDTO billDTO) {
        try {
            BillDTO createdBill = billService.createBill(billDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBill);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBill(@PathVariable Long id, @RequestBody BillDTO billDTO) {
        try {
            BillDTO updatedBill = billService.updateBill(id, billDTO);
            return ResponseEntity.ok(updatedBill);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ResponseEntity<?> getBillById(@PathVariable Long id) {
        try {
            BillDTO bill = billService.getBillById(id);
            return ResponseEntity.ok(bill);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ResponseEntity<?> getBillsByPatient(@PathVariable Long patientId) {
        try {
            List<BillDTO> bills = billService.getBillsByPatient(patientId);
            return ResponseEntity.ok(bills);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBillsByStatus(@PathVariable String status) {
        try {
            List<BillDTO> bills = billService.getBillsByStatus(status);
            return ResponseEntity.ok(bills);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllBills() {
        List<BillDTO> bills = billService.getAllBills();
        return ResponseEntity.ok(bills);
    }
    
    @PatchMapping("/{id}/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBillStatus(@PathVariable Long id, @PathVariable String status) {
        try {
            BillDTO updatedBill = billService.updateBillStatus(id, status);
            return ResponseEntity.ok(updatedBill);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBill(@PathVariable Long id) {
        try {
            billService.deleteBill(id);
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Bill deleted successfully");
            }});
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
}

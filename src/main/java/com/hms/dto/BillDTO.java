package com.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private String billNumber;
    private BigDecimal consultationCharges;
    private BigDecimal medicineCharges;
    private BigDecimal testCharges;
    private BigDecimal otherCharges;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private String status;
    private String notes;
    private LocalDateTime billDate;
}

package com.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long medicalRecordId;
    private String medicineName;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
    private String status;
    private LocalDateTime prescribedDate;
}

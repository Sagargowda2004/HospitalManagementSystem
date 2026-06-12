package com.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long appointmentId;
    private String diagnosis;
    private String treatment;
    private String notes;
    private String bloodPressure;
    private String temperature;
    private String heartRate;
    private String weight;
    private String height;
    private LocalDateTime recordDate;
}

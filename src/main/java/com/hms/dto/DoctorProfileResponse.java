package com.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorProfileResponse {
    private Long id;
    private String email;
    private String name;
    private String specialization;
    private Integer experience;
}

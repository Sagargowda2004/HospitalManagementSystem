package com.hms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.entity.PatientProfile;
import com.hms.service.PatientService;

@RestController
@RequestMapping("/patient")
public class PatientController {

    @Autowired
    private PatientService service;

    @PreAuthorize("hasAnyAuthority('ADMIN','RECEPTIONIST')")
    @PostMapping("/add")
    public PatientProfile addPatient(@RequestBody PatientProfile p) {
        return service.createPatient(p);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','RECEPTIONIST','PATIENT')")
    @GetMapping("/{id}")
    public PatientProfile getPatient(@PathVariable Long id) {
        return service.getPatient(id);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','RECEPTIONIST','PATIENT')")
    @GetMapping("/me")
    public PatientProfile getPatientMe(org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        return service.getPatientByUserEmail(authentication.getName());
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','RECEPTIONIST')")
    @GetMapping("/all")
    public List<PatientProfile> getAllPatients() {
        return service.getAllPatients();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','RECEPTIONIST')")
    @DeleteMapping("/delete/{id}")
    public String deletePatient(@PathVariable Long id) {
        return service.deletePatient(id);
    }
}

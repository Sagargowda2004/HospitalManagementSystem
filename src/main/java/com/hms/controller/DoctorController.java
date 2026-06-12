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

import com.hms.entity.DoctorProfile;
import com.hms.service.DoctorService;

@RestController
@RequestMapping("/doctor")
public class DoctorController {

    @Autowired
    private DoctorService service;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/add")
    public DoctorProfile addDoctor(@RequestBody DoctorProfile doctor) {
        return service.createDoctor(doctor);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','DOCTOR')")
    @GetMapping("/{id}")
    public DoctorProfile getDoctor(@PathVariable Long id) {
        return service.getDoctorById(id);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','DOCTOR')")
    @GetMapping("/me")
    public DoctorProfile getDoctorMe(org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        return service.getDoctorByUserEmail(authentication.getName());
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','DOCTOR')")
    @GetMapping("/all")
    public List<DoctorProfile> getAllDoctors() {
        return service.getAllDoctors();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public String deleteDoctor(@PathVariable Long id) {
        return service.deleteDoctor(id);
    }
}


package com.hms.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import com.hms.dto.DoctorCreateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.entity.DoctorProfile;
import com.hms.dto.DoctorProfileResponse;
import com.hms.service.DoctorService;

@RestController
@RequestMapping("/doctor")
public class DoctorController {

    @Autowired
    private DoctorService service;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/add")
    public DoctorProfile addDoctor(@RequestBody DoctorCreateRequest doctor) {
        return service.createDoctor(doctor);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','DOCTOR')")
    @GetMapping("/{id}")
    public DoctorProfile getDoctor(@PathVariable Long id) {
        return service.getDoctorById(id);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','DOCTOR')")
    @GetMapping("/me")
    public ResponseEntity<?> getDoctorMe(org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }
        DoctorProfile doc = service.getDoctorByUserEmail(authentication.getName());
        if (doc == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Doctor profile not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
        DoctorProfileResponse resp = new DoctorProfileResponse(
            doc.getId(),
            doc.getUser().getEmail(),
            doc.getUser().getName(),
            doc.getSpecialization(),
            doc.getExperience()
        );
        return ResponseEntity.ok(resp);
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


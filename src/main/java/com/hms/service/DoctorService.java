package com.hms.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hms.entity.DoctorProfile;
import com.hms.repository.DoctorProfileRepository;

@Service
public class DoctorService {

    @Autowired
    private DoctorProfileRepository repo;

    public DoctorProfile createDoctor(DoctorProfile doctor) {
        return repo.save(doctor);
    }

    public DoctorProfile getDoctorById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public DoctorProfile getDoctorByUserEmail(String email) {
        return repo.findByUserEmail(email).orElse(null);
    }

    public List<DoctorProfile> getAllDoctors() {
        return repo.findAll();
    }

    public String deleteDoctor(Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return "Doctor deleted";
        } else {
            return "Doctor not found";
        }
    }
}


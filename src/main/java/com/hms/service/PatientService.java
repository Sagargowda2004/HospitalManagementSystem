package com.hms.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hms.entity.PatientProfile;
import com.hms.repository.PatientProfileRepository;

@Service
public class PatientService {

    @Autowired
    private PatientProfileRepository repo;

    public PatientProfile createPatient(PatientProfile p) {
        return repo.save(p);
    }

    public PatientProfile getPatient(Long id) {
        return repo.findById(id).orElse(null);
    }

    public PatientProfile getPatientByUserEmail(String email) {
        return repo.findByUserEmail(email).orElse(null);
    }

    public List<PatientProfile> getAllPatients() {
        return repo.findAll();
    }

    public String deletePatient(Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return "Patient deleted successfully";
        }
        return "Patient not found";
    }
}


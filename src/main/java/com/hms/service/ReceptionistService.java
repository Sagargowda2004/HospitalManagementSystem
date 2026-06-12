package com.hms.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hms.entity.ReceptionistProfile;
import com.hms.repository.ReceptionistProfileRepository;

@Service
public class ReceptionistService {

    @Autowired
    private ReceptionistProfileRepository repo;

    public ReceptionistProfile create(ReceptionistProfile profile) {
        return repo.save(profile);
    }

    public List<ReceptionistProfile> getAll() {
        return repo.findAll();
    }

    public ReceptionistProfile getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public String delete(Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return "Receptionist deleted";
        }
        return "Receptionist not found";
    }
}

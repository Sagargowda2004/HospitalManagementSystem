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

import com.hms.entity.ReceptionistProfile;
import com.hms.service.ReceptionistService;

@RestController
@RequestMapping("/receptionist")
public class ReceptionistController {

    @Autowired
    private ReceptionistService service;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/add")
    public ReceptionistProfile add(@RequestBody ReceptionistProfile r) {
        return service.create(r);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','RECEPTIONIST')")
    @GetMapping("/{id}")
    public ReceptionistProfile get(@PathVariable Long id) {
        return service.getById(id);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','RECEPTIONIST')")
    @GetMapping("/all")
    public List<ReceptionistProfile> all() {
        return service.getAll();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        return service.delete(id);
    }
}

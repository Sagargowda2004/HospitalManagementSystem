package com.hms.service;

import com.hms.dto.PrescriptionDTO;
import com.hms.entity.Prescription;
import com.hms.entity.PatientProfile;
import com.hms.entity.DoctorProfile;
import com.hms.repository.PrescriptionRepository;
import com.hms.repository.PatientProfileRepository;
import com.hms.repository.DoctorProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {
    
    @Autowired
    private PrescriptionRepository prescriptionRepository;
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    
    @Autowired
    private DoctorProfileRepository doctorProfileRepository;
    
    public PrescriptionDTO createPrescription(PrescriptionDTO prescriptionDTO) {
        Optional<PatientProfile> patientOpt = patientProfileRepository.findById(prescriptionDTO.getPatientId());
        Optional<DoctorProfile> doctorOpt = doctorProfileRepository.findById(prescriptionDTO.getDoctorId());
        
        if (!patientOpt.isPresent()) {
            throw new RuntimeException("Patient not found");
        }
        if (!doctorOpt.isPresent()) {
            throw new RuntimeException("Doctor not found");
        }
        
        Prescription prescription = Prescription.builder()
                .patient(patientOpt.get())
                .doctor(doctorOpt.get())
                .medicineName(prescriptionDTO.getMedicineName())
                .dosage(prescriptionDTO.getDosage())
                .frequency(prescriptionDTO.getFrequency())
                .duration(prescriptionDTO.getDuration())
                .instructions(prescriptionDTO.getInstructions())
                .status("ACTIVE")
                .build();
        
        Prescription savedPrescription = prescriptionRepository.save(prescription);
        return mapToDTO(savedPrescription);
    }
    
    public PrescriptionDTO updatePrescription(Long id, PrescriptionDTO prescriptionDTO) {
        Optional<Prescription> prescriptionOpt = prescriptionRepository.findById(id);
        if (!prescriptionOpt.isPresent()) {
            throw new RuntimeException("Prescription not found");
        }
        
        Prescription prescription = prescriptionOpt.get();
        
        if (prescriptionDTO.getMedicineName() != null) {
            prescription.setMedicineName(prescriptionDTO.getMedicineName());
        }
        if (prescriptionDTO.getDosage() != null) {
            prescription.setDosage(prescriptionDTO.getDosage());
        }
        if (prescriptionDTO.getFrequency() != null) {
            prescription.setFrequency(prescriptionDTO.getFrequency());
        }
        if (prescriptionDTO.getDuration() != null) {
            prescription.setDuration(prescriptionDTO.getDuration());
        }
        if (prescriptionDTO.getInstructions() != null) {
            prescription.setInstructions(prescriptionDTO.getInstructions());
        }
        if (prescriptionDTO.getStatus() != null) {
            prescription.setStatus(prescriptionDTO.getStatus());
        }
        
        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        return mapToDTO(updatedPrescription);
    }
    
    public PrescriptionDTO getPrescriptionById(Long id) {
        Optional<Prescription> prescriptionOpt = prescriptionRepository.findById(id);
        if (!prescriptionOpt.isPresent()) {
            throw new RuntimeException("Prescription not found");
        }
        return mapToDTO(prescriptionOpt.get());
    }
    
    public List<PrescriptionDTO> getPrescriptionsByPatient(Long patientId) {
        Optional<PatientProfile> patientOpt = patientProfileRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            throw new RuntimeException("Patient not found");
        }
        
        return prescriptionRepository.findByPatient(patientOpt.get())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PrescriptionDTO> getPrescriptionsByDoctor(Long doctorId) {
        Optional<DoctorProfile> doctorOpt = doctorProfileRepository.findById(doctorId);
        if (!doctorOpt.isPresent()) {
            throw new RuntimeException("Doctor not found");
        }
        
        return prescriptionRepository.findByDoctor(doctorOpt.get())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PrescriptionDTO> getPrescriptionsByStatus(String status) {
        return prescriptionRepository.findByStatus(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PrescriptionDTO> getAllPrescriptions() {
        return prescriptionRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public void deletePrescription(Long id) {
        Optional<Prescription> prescriptionOpt = prescriptionRepository.findById(id);
        if (!prescriptionOpt.isPresent()) {
            throw new RuntimeException("Prescription not found");
        }
        
        prescriptionRepository.deleteById(id);
    }
    
    private PrescriptionDTO mapToDTO(Prescription prescription) {
        return new PrescriptionDTO(
                prescription.getId(),
                prescription.getPatient().getId(),
                prescription.getPatient().getUser().getName(),
                prescription.getDoctor().getId(),
                prescription.getDoctor().getUser().getName(),
                prescription.getMedicalRecord() != null ? prescription.getMedicalRecord().getId() : null,
                prescription.getMedicineName(),
                prescription.getDosage(),
                prescription.getFrequency(),
                prescription.getDuration(),
                prescription.getInstructions(),
                prescription.getStatus(),
                prescription.getPrescribedDate()
        );
    }
}

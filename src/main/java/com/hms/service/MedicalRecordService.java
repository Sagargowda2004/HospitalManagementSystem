package com.hms.service;

import com.hms.dto.MedicalRecordDTO;
import com.hms.entity.MedicalRecord;
import com.hms.entity.PatientProfile;
import com.hms.entity.DoctorProfile;
import com.hms.entity.Appointment;
import com.hms.repository.MedicalRecordRepository;
import com.hms.repository.PatientProfileRepository;
import com.hms.repository.DoctorProfileRepository;
import com.hms.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {
    
    @Autowired
    private MedicalRecordRepository medicalRecordRepository;
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    
    @Autowired
    private DoctorProfileRepository doctorProfileRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    public MedicalRecordDTO createMedicalRecord(MedicalRecordDTO recordDTO) {
        Optional<PatientProfile> patientOpt = patientProfileRepository.findById(recordDTO.getPatientId());
        Optional<DoctorProfile> doctorOpt = doctorProfileRepository.findById(recordDTO.getDoctorId());
        
        if (!patientOpt.isPresent()) {
            throw new RuntimeException("Patient not found");
        }
        if (!doctorOpt.isPresent()) {
            throw new RuntimeException("Doctor not found");
        }
        
        MedicalRecord medicalRecord = MedicalRecord.builder()
                .patient(patientOpt.get())
                .doctor(doctorOpt.get())
                .diagnosis(recordDTO.getDiagnosis())
                .treatment(recordDTO.getTreatment())
                .notes(recordDTO.getNotes())
                .bloodPressure(recordDTO.getBloodPressure())
                .temperature(recordDTO.getTemperature())
                .heartRate(recordDTO.getHeartRate())
                .weight(recordDTO.getWeight())
                .height(recordDTO.getHeight())
                .recordDate(recordDTO.getRecordDate() != null ? recordDTO.getRecordDate() : LocalDateTime.now())
                .build();
        
        if (recordDTO.getAppointmentId() != null) {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(recordDTO.getAppointmentId());
            appointmentOpt.ifPresent(medicalRecord::setAppointment);
        }
        
        MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);
        return mapToDTO(savedRecord);
    }
    
    public MedicalRecordDTO updateMedicalRecord(Long id, MedicalRecordDTO recordDTO) {
        Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(id);
        if (!recordOpt.isPresent()) {
            throw new RuntimeException("Medical record not found");
        }
        
        MedicalRecord medicalRecord = recordOpt.get();
        
        if (recordDTO.getDiagnosis() != null) {
            medicalRecord.setDiagnosis(recordDTO.getDiagnosis());
        }
        if (recordDTO.getTreatment() != null) {
            medicalRecord.setTreatment(recordDTO.getTreatment());
        }
        if (recordDTO.getNotes() != null) {
            medicalRecord.setNotes(recordDTO.getNotes());
        }
        if (recordDTO.getBloodPressure() != null) {
            medicalRecord.setBloodPressure(recordDTO.getBloodPressure());
        }
        if (recordDTO.getTemperature() != null) {
            medicalRecord.setTemperature(recordDTO.getTemperature());
        }
        if (recordDTO.getHeartRate() != null) {
            medicalRecord.setHeartRate(recordDTO.getHeartRate());
        }
        if (recordDTO.getWeight() != null) {
            medicalRecord.setWeight(recordDTO.getWeight());
        }
        if (recordDTO.getHeight() != null) {
            medicalRecord.setHeight(recordDTO.getHeight());
        }
        
        MedicalRecord updatedRecord = medicalRecordRepository.save(medicalRecord);
        return mapToDTO(updatedRecord);
    }
    
    public MedicalRecordDTO getMedicalRecordById(Long id) {
        Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(id);
        if (!recordOpt.isPresent()) {
            throw new RuntimeException("Medical record not found");
        }
        return mapToDTO(recordOpt.get());
    }
    
    public List<MedicalRecordDTO> getMedicalRecordsByPatient(Long patientId) {
        Optional<PatientProfile> patientOpt = patientProfileRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            throw new RuntimeException("Patient not found");
        }
        
        return medicalRecordRepository.findByPatient(patientOpt.get())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MedicalRecordDTO> getMedicalRecordsByDoctor(Long doctorId) {
        Optional<DoctorProfile> doctorOpt = doctorProfileRepository.findById(doctorId);
        if (!doctorOpt.isPresent()) {
            throw new RuntimeException("Doctor not found");
        }
        
        return medicalRecordRepository.findByDoctor(doctorOpt.get())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MedicalRecordDTO> getAllMedicalRecords() {
        return medicalRecordRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public void deleteMedicalRecord(Long id) {
        Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(id);
        if (!recordOpt.isPresent()) {
            throw new RuntimeException("Medical record not found");
        }
        
        medicalRecordRepository.deleteById(id);
    }
    
    private MedicalRecordDTO mapToDTO(MedicalRecord record) {
        return new MedicalRecordDTO(
                record.getId(),
                record.getPatient().getId(),
                record.getPatient().getUser().getName(),
                record.getDoctor().getId(),
                record.getDoctor().getUser().getName(),
                record.getAppointment() != null ? record.getAppointment().getId() : null,
                record.getDiagnosis(),
                record.getTreatment(),
                record.getNotes(),
                record.getBloodPressure(),
                record.getTemperature(),
                record.getHeartRate(),
                record.getWeight(),
                record.getHeight(),
                record.getRecordDate()
        );
    }
}

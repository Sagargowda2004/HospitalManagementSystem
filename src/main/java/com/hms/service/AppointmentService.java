package com.hms.service;

import com.hms.dto.AppointmentDTO;
import com.hms.entity.Appointment;
import com.hms.entity.Department;
import com.hms.entity.DoctorProfile;
import com.hms.entity.PatientProfile;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DepartmentRepository;
import com.hms.repository.DoctorProfileRepository;
import com.hms.repository.PatientProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    
    @Autowired
    private DoctorProfileRepository doctorProfileRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        Optional<PatientProfile> patientOpt = patientProfileRepository.findById(appointmentDTO.getPatientId());
        Optional<DoctorProfile> doctorOpt = doctorProfileRepository.findById(appointmentDTO.getDoctorId());
        Optional<Department> departmentOpt = departmentRepository.findById(appointmentDTO.getDepartmentId());
        
        if (!patientOpt.isPresent()) {
            throw new RuntimeException("Patient not found");
        }
        if (!doctorOpt.isPresent()) {
            throw new RuntimeException("Doctor not found");
        }
        if (!departmentOpt.isPresent()) {
            throw new RuntimeException("Department not found");
        }
        
        Appointment appointment = Appointment.builder()
                .patient(patientOpt.get())
                .doctor(doctorOpt.get())
                .department(departmentOpt.get())
                .appointmentDate(appointmentDTO.getAppointmentDate())
                .reason(appointmentDTO.getReason())
                .status("SCHEDULED")
                .notes(appointmentDTO.getNotes())
                .build();
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToDTO(savedAppointment);
    }
    
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
        if (!appointmentOpt.isPresent()) {
            throw new RuntimeException("Appointment not found");
        }
        
        Appointment appointment = appointmentOpt.get();
        
        if (appointmentDTO.getAppointmentDate() != null) {
            appointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        }
        if (appointmentDTO.getReason() != null) {
            appointment.setReason(appointmentDTO.getReason());
        }
        if (appointmentDTO.getStatus() != null) {
            appointment.setStatus(appointmentDTO.getStatus());
        }
        if (appointmentDTO.getNotes() != null) {
            appointment.setNotes(appointmentDTO.getNotes());
        }
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToDTO(updatedAppointment);
    }
    
    public AppointmentDTO getAppointmentById(Long id) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
        if (!appointmentOpt.isPresent()) {
            throw new RuntimeException("Appointment not found");
        }
        return mapToDTO(appointmentOpt.get());
    }
    
    public List<AppointmentDTO> getAppointmentsByPatient(Long patientId) {
        Optional<PatientProfile> patientOpt = patientProfileRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            throw new RuntimeException("Patient not found");
        }
        
        return appointmentRepository.findByPatient(patientOpt.get())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<AppointmentDTO> getAppointmentsByDoctor(Long doctorId) {
        Optional<DoctorProfile> doctorOpt = doctorProfileRepository.findById(doctorId);
        if (!doctorOpt.isPresent()) {
            throw new RuntimeException("Doctor not found");
        }
        
        return appointmentRepository.findByDoctor(doctorOpt.get())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<AppointmentDTO> getAppointmentsByStatus(String status) {
        return appointmentRepository.findByStatus(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public void deleteAppointment(Long id) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
        if (!appointmentOpt.isPresent()) {
            throw new RuntimeException("Appointment not found");
        }
        
        appointmentRepository.deleteById(id);
    }
    
    private AppointmentDTO mapToDTO(Appointment appointment) {
        return new AppointmentDTO(
                appointment.getId(),
                appointment.getPatient().getId(),
                appointment.getPatient().getUser().getName(),
                appointment.getDoctor().getId(),
                appointment.getDoctor().getUser().getName(),
                appointment.getDepartment().getId(),
                appointment.getDepartment().getName(),
                appointment.getAppointmentDate(),
                appointment.getReason(),
                appointment.getStatus(),
                appointment.getNotes()
        );
    }
}

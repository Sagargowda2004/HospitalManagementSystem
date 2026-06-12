package com.hms.service;

import com.hms.dto.DepartmentDTO;
import com.hms.entity.Department;
import com.hms.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DepartmentService {
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    public DepartmentDTO createDepartment(DepartmentDTO departmentDTO) {
        if (departmentRepository.findByName(departmentDTO.getName()).isPresent()) {
            throw new RuntimeException("Department with this name already exists");
        }
        
        Department department = Department.builder()
                .name(departmentDTO.getName())
                .description(departmentDTO.getDescription())
                .phoneNumber(departmentDTO.getPhoneNumber())
                .headName(departmentDTO.getHeadName())
                .isActive(true)
                .build();
        
        Department savedDepartment = departmentRepository.save(department);
        return mapToDTO(savedDepartment);
    }
    
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO) {
        Optional<Department> departmentOpt = departmentRepository.findById(id);
        if (!departmentOpt.isPresent()) {
            throw new RuntimeException("Department not found");
        }
        
        Department department = departmentOpt.get();
        if (departmentDTO.getName() != null && !departmentDTO.getName().equals(department.getName())) {
            if (departmentRepository.findByName(departmentDTO.getName()).isPresent()) {
                throw new RuntimeException("Department with this name already exists");
            }
            department.setName(departmentDTO.getName());
        }
        
        if (departmentDTO.getDescription() != null) {
            department.setDescription(departmentDTO.getDescription());
        }
        if (departmentDTO.getPhoneNumber() != null) {
            department.setPhoneNumber(departmentDTO.getPhoneNumber());
        }
        if (departmentDTO.getHeadName() != null) {
            department.setHeadName(departmentDTO.getHeadName());
        }
        if (departmentDTO.getIsActive() != null) {
            department.setIsActive(departmentDTO.getIsActive());
        }
        
        Department updatedDepartment = departmentRepository.save(department);
        return mapToDTO(updatedDepartment);
    }
    
    public DepartmentDTO getDepartmentById(Long id) {
        Optional<Department> departmentOpt = departmentRepository.findById(id);
        if (!departmentOpt.isPresent()) {
            throw new RuntimeException("Department not found");
        }
        return mapToDTO(departmentOpt.get());
    }
    
    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<DepartmentDTO> getActiveDepartments() {
        return departmentRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public void deleteDepartment(Long id) {
        Optional<Department> departmentOpt = departmentRepository.findById(id);
        if (!departmentOpt.isPresent()) {
            throw new RuntimeException("Department not found");
        }
        
        Department department = departmentOpt.get();
        department.setIsActive(false);
        departmentRepository.save(department);
    }
    
    private DepartmentDTO mapToDTO(Department department) {
        return new DepartmentDTO(
                department.getId(),
                department.getName(),
                department.getDescription(),
                department.getPhoneNumber(),
                department.getHeadName(),
                department.getIsActive()
        );
    }
}

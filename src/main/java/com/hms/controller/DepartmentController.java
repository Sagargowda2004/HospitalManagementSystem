package com.hms.controller;

import com.hms.dto.DepartmentDTO;
import com.hms.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {
    
    @Autowired
    private DepartmentService departmentService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDepartment(@RequestBody DepartmentDTO departmentDTO) {
        try {
            DepartmentDTO createdDepartment = departmentService.createDepartment(departmentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDepartment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody DepartmentDTO departmentDTO) {
        try {
            DepartmentDTO updatedDepartment = departmentService.updateDepartment(id, departmentDTO);
            return ResponseEntity.ok(updatedDepartment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getDepartmentById(@PathVariable Long id) {
        try {
            DepartmentDTO department = departmentService.getDepartmentById(id);
            return ResponseEntity.ok(department);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllDepartments() {
        List<DepartmentDTO> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }
    
    @GetMapping("/active/list")
    public ResponseEntity<?> getActiveDepartments() {
        List<DepartmentDTO> departments = departmentService.getActiveDepartments();
        return ResponseEntity.ok(departments);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        try {
            departmentService.deleteDepartment(id);
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Department deleted successfully");
            }});
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        }
    }
}

package com.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.hms.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    User findByEmail(String email);
}

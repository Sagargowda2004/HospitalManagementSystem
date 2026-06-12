package com.hms.repository;

import com.hms.entity.Notification;
import com.hms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUser(User user);
    
    List<Notification> findByStatus(String status);
    
    List<Notification> findByType(String type);
    
    List<Notification> findByUserAndStatus(User user, String status);
    
    List<Notification> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}

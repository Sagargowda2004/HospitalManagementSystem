package com.hms.repository;

import com.hms.entity.RefreshToken;
import com.hms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    
    Optional<RefreshToken> findByToken(String token);
    
    Optional<RefreshToken> findByUserAndRevokedFalse(User user);
    
    @Modifying
    @Query("DELETE FROM RefreshToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(LocalDateTime now);
    
    @Modifying
    void deleteByUser(User user);
}

package com.hms.service;

import com.hms.entity.RefreshToken;
import com.hms.entity.TokenBlacklist;
import com.hms.entity.User;
import com.hms.repository.RefreshTokenRepository;
import com.hms.repository.TokenBlacklistRepository;
import com.hms.repository.UserRepository;
import com.hms.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;

@Service
public class TokenService {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    
    @Autowired
    private TokenBlacklistRepository tokenBlacklistRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new refresh token for the user
     */
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Revoke any existing refresh tokens for this user
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByUserAndRevokedFalse(user);
        existingToken.ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
        
        String token = jwtUtil.generateRefreshToken(user.getEmail());
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);
        
        RefreshToken refreshToken = new RefreshToken(token, user, expiresAt);
        return refreshTokenRepository.save(refreshToken);
    }
    
    /**
     * Verify and validate a refresh token
     */
    public Optional<RefreshToken> verifyRefreshToken(String token) {
        Optional<RefreshToken> refreshToken = refreshTokenRepository.findByToken(token);
        
        if (refreshToken.isPresent()) {
            RefreshToken rt = refreshToken.get();
            if (!rt.getRevoked() && !rt.isExpired() && jwtUtil.validateRefreshToken(token)) {
                return refreshToken;
            }
        }
        return Optional.empty();
    }
    
    /**
     * Revoke a token by adding it to the blacklist
     */
    @Transactional
    public void revokeToken(String token, String email) {
        if (jwtUtil.validateToken(token)) {
            long expirationTime = jwtUtil.getExpirationTimeFromToken(token);
            LocalDateTime expiresAt = new Date(expirationTime).toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
            
            TokenBlacklist blacklistedToken = new TokenBlacklist(token, email, expiresAt);
            tokenBlacklistRepository.save(blacklistedToken);
        }
    }
    
    /**
     * Logout user - revoke refresh token and blacklist access token
     */
    @Transactional
    public void logout(String email, String accessToken) {
        // Blacklist the access token
        revokeToken(accessToken, email);

        User user = userRepository.findByEmail(email);

        if (user != null) {
            Optional<RefreshToken> refreshToken =
                    refreshTokenRepository.findByUserAndRevokedFalse(user);

            refreshToken.ifPresent(rt -> {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            });
        }
    }
    
    /**
     * Clean up expired tokens from the database (should be run periodically)
     */
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        tokenBlacklistRepository.deleteExpiredTokens(now);
        refreshTokenRepository.deleteExpiredTokens(now);
    }
}

package com.hms.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms:3600000}")
    private long expirationMs;
    
    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs; // 7 days

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("type", "access")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    
    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    
    // Legacy method for backward compatibility
    public String generateToken(String email, String role) {
        return generateAccessToken(email, role);
    }

    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }
    
    public String getTokenTypeFromToken(String token) {
        return getClaims(token).get("type", String.class);
    }
    
    public long getExpirationTimeFromToken(String token) {
        return getClaims(token).getExpiration().getTime();
    }
    
    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
    
    public boolean validateAccessToken(String token) {
        try {
            Claims claims = getClaims(token);
            String type = claims.get("type", String.class);
            return "access".equals(type);
        } catch (Exception ex) {
            return false;
        }
    }
    
    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = getClaims(token);
            String type = claims.get("type", String.class);
            return "refresh".equals(type);
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

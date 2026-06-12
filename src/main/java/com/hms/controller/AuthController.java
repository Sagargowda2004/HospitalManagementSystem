package com.hms.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hms.dto.LoginRequest;
import com.hms.dto.LoginResponse;
import com.hms.dto.RefreshTokenRequest;
import com.hms.dto.SignupRequest;
import com.hms.dto.TokenResponse;
import com.hms.dto.UserProfileResponse;
import com.hms.dto.ForgotPasswordRequest;
import com.hms.entity.RefreshToken;
import com.hms.entity.User;
import com.hms.service.AuthService;
import com.hms.service.TokenService;
import com.hms.security.JwtUtil;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private TokenService tokenService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        String result = authService.signup(request);

        if ("EMAIL_EXISTS".equals(result)) {
            return ResponseEntity.badRequest().body("User already exists with this email");
        }

        return ResponseEntity.ok("Signup successful");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        TokenResponse response = authService.loginWithRefreshToken(request);

        if (response == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        Optional<RefreshToken> refreshToken = tokenService.verifyRefreshToken(request.getRefreshToken());
        
        if (refreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired refresh token");
        }
        
        RefreshToken rt = refreshToken.get();
        String email = rt.getUser().getEmail();
        String role = rt.getUser().getRole();
        
        String newAccessToken = jwtUtil.generateAccessToken(email, role);
        
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", newAccessToken);
        response.put("refreshToken", request.getRefreshToken());
        response.put("tokenType", "Bearer");
        response.put("expiresIn", 3600);
        response.put("role", role);
        response.put("email", email);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication, @RequestHeader("Authorization") String authHeader) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        
        String email = authentication.getName();
        String accessToken = null;
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7);
        }
        
        if (accessToken != null) {
            tokenService.logout(email, accessToken);
        }
        
        return ResponseEntity.ok(new HashMap<String, String>() {{
            put("message", "Logout successful");
        }});
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        User user = authService.getUserProfile(authentication.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User profile not found");
        }

        UserProfileResponse profile = new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String result = authService.updatePassword(request.getEmail(), request.getNewPassword());

        if ("USER_NOT_FOUND".equals(result)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user found with this email address");
        }

        return ResponseEntity.ok("Password updated successfully");
    }
}

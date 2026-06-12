package com.hms.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.hms.dto.SignupRequest;
import com.hms.dto.LoginRequest;
import com.hms.dto.LoginResponse;
import com.hms.dto.TokenResponse;
import com.hms.entity.RefreshToken;
import com.hms.entity.User;
import com.hms.repository.UserRepository;
import com.hms.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private TokenService tokenService;

    public String signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return "EMAIL_EXISTS";
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        userRepository.save(user);
        return "SUCCESS";
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail());

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return null;
        }

        String token = jwtUtil.generateAccessToken(user.getEmail(), user.getRole());
        return new LoginResponse("Login successful", user.getRole(), token);
    }
    
    /**
     * Enhanced login with refresh token
     */
    public TokenResponse loginWithRefreshToken(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail());

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return null;
        }

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole());
        RefreshToken refreshToken = tokenService.createRefreshToken(user);

        return new TokenResponse(
                accessToken,
                refreshToken.getToken(),
                "Bearer",
                3600, // 1 hour in seconds
                user.getRole(),
                user.getEmail()
        );
    }

    public User getUserProfile(String email) {
        return userRepository.findByEmail(email);
    }

    public String updatePassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return "USER_NOT_FOUND";
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return "SUCCESS";
    }
}

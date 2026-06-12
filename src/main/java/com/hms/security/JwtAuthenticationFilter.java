
package com.hms.security;

import com.hms.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.hms.repository.TokenBlacklistRepository;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TokenBlacklistRepository tokenBlacklistRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, TokenBlacklistRepository tokenBlacklistRepository) {
        this.jwtUtil = jwtUtil;
        this.tokenBlacklistRepository = tokenBlacklistRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            
            // Check if token is blacklisted
            if (isTokenBlacklisted(token)) {
                filterChain.doFilter(request, response);
                return;
            }
            
            if (jwtUtil.validateToken(token) && jwtUtil.validateAccessToken(token)) {
                String email = jwtUtil.getEmailFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(
                                    new SimpleGrantedAuthority(role.toUpperCase()),
                                    new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())
                            )
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
    
    private boolean isTokenBlacklisted(String token) {
        return tokenBlacklistRepository.findByToken(token).isPresent();
    }
}

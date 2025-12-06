package com.santimaszong.Sistema_de_Gestion_de_Programas.services.auth;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.AuthResponse;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.LoginRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.RegisterRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final MyUserDetailsService userDetailsService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already in use");
        }
        UserEntity user = new UserEntity();
        user.setNombre(req.nombre());
        user.setApellido(req.apellido());
        user.setDni(req.dni());
        user.setLegajo(req.legajo());
        user.setEmail(req.email());
        user.setRoles(req.roles());
        user.setPassword(passwordEncoder.encode(req.password()));

        userRepo.save(user);
        String access = jwtService.generateToken(user.getUsername());

        return new AuthResponse(access);
    }

    public AuthResponse login(LoginRequest req, HttpServletResponse response) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.email(),
                        req.password()
                )
        );

//        UserEntity user = userRepo.findByEmail(req.email())
//                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        UserDetails user = (UserDetails) auth.getPrincipal();

        String accessToken = jwtService.generateToken(user.getUsername() );

//        // Set refresh token as HttpOnly cookie
//        Cookie cookie = new Cookie("refresh_token", refreshToken);
//        cookie.setHttpOnly(true);
//        cookie.setPath("/auth/refresh");
//        cookie.setMaxAge((int) (jwtService.getRefreshExpirationMs() / 1000));
//        // cookie.setSecure(true); // enable in prod
//        cookie.setSameSite("Strict"); // Tomcat 9+ supports via response header; may require helper
//        response.addCookie(cookie);

        return new AuthResponse(accessToken);
    }

    public AuthResponse refresh(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        var user = (UserEntity) userDetailsService.loadUserByUsername(username);
        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new IllegalArgumentException("Refresh token inválido");
        }
        String newAccess = jwtService.generateToken(user.getUsername());
        return new AuthResponse(newAccess);
    }

    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/auth/refresh");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}

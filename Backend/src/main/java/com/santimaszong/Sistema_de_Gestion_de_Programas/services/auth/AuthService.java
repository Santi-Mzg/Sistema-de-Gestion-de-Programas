package com.santimaszong.Sistema_de_Gestion_de_Programas.services.auth;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.LoginRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.RegisterRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.UserMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
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
    private final UserMapper userMapper;

    public void register(RegisterRequest req) {
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
    }

    public UserResponseDTO login(LoginRequest req, HttpServletResponse response) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.email(),
                        req.password()
                )
        );

        UserDetails userDetails = (UserDetails) auth.getPrincipal();

        String token = jwtService.generateToken(userDetails.getUsername());

        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
//                .secure(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(24 * 60 * 60)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        UserEntity user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Usuario autenticado no encontrado"));

        return userMapper.toDTO(user);
    }

    public UserResponseDTO me(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        UserEntity user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Usuario autenticado no encontrado"));

        return userMapper.toDTO(user);
    }

    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("jwt", null)
                .httpOnly(true)
//                .secure(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}

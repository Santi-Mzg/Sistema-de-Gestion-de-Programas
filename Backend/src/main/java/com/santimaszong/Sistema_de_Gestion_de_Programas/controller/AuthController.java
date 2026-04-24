package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.ForgotPasswordRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.ResetPasswordRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.LoginRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.auth.AuthService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.java.Log;

import java.util.Collections;


@Log
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletResponse res) {
        String token = authService.login(req, res);
        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> me(Authentication authentication) {
        UserResponseDTO user = authService.me(authentication);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/set-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        authService.setPassword(req);
        return ResponseEntity.ok("Contraseña actualizada.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req);
        return ResponseEntity.ok("Cambio de contraseña solicitado.");
    }

}

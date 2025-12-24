package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.LoginRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.RegisterRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.auth.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.java.Log;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


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
    public ResponseEntity<UserResponseDTO> login(@RequestBody LoginRequest req, HttpServletResponse res) {
        UserResponseDTO user = authService.login(req, res);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> me(Authentication authentication) {
        UserResponseDTO user = authService.me(authentication);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse res) {
        authService.logout(res);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody String email) {
//        // 1. Generar la contraseña aleatoria
//        String temporaryPassword = passwordGeneratorService.generateSafePassword(16);
//
//        // 2. Encriptarla para la DB
//        String hashedBtn = passwordEncoder.encode(temporaryPassword);
//
//        // 3. Actualizar el usuario en DB
//        usuarioService.updatePassword(email, hashedBtn);
//
//        // 4. Enviar la contraseña EN TEXTO PLANO por email al usuario
//        emailService.sendPasswordReset(email, temporaryPassword);

        return ResponseEntity.ok("Nueva contraseña enviada.");
    }

}

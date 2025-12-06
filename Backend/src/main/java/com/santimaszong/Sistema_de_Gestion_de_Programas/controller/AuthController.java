package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.AuthResponse;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.LoginRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.RegisterRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UserService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.auth.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.java.Log;
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


    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req, HttpServletResponse res) {
        return authService.login(req, res);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(HttpServletRequest req) {
        // Get cookie
        Cookie[] cookies = req.getCookies();
        if (cookies == null) throw new IllegalArgumentException("No refresh cookie");
        String refresh = null;
        for (Cookie c : cookies) {
            if ("refresh_token".equals(c.getName())) {
                refresh = c.getValue();
                break;
            }
        }
        if (refresh == null) throw new IllegalArgumentException("No refresh token");
        return authService.refresh(refresh);
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse res) {
        authService.logout(res);
    }

}

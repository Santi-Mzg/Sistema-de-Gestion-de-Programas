package com.santimaszong.Sistema_de_Gestion_de_Programas.services.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.LoginRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.UserMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public String login(LoginRequest req, HttpServletResponse response) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.legajo(),
                        req.password()
                )
        );

        UserDetails userDetails = (UserDetails) auth.getPrincipal();

        String token = jwtService.generateToken(userDetails.getUsername());

//        UserEntity user = userRepo.findByLegajoWithDepartamentosAndRoles(userDetails.getUsername())
//                .orElseThrow(() -> new EntityNotFoundException("Usuario autenticado no encontrado"));
//
//        UserResponseDTO userResp = userMapper.toDTO(user);
//
//        userResp.setToken(token);

        return token;
    }

    public UserResponseDTO me(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        UserEntity user = userRepo.findByLegajoWithDepartamentos(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Usuario autenticado no encontrado"));

        return userMapper.toDTO(user);
    }
}

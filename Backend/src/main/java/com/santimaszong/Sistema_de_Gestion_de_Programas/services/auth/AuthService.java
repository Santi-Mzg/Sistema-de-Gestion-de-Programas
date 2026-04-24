package com.santimaszong.Sistema_de_Gestion_de_Programas.services.auth;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.ForgotPasswordRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.ResetPasswordRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.PasswordTokenEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.TokenType;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.PasswordTokenRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.LoginRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.UserMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordTokenRepository tokenRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final PasswordTokenRepository tokenRepo;



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

    @Transactional
    public void setPassword(ResetPasswordRequest req) {
        PasswordTokenEntity token = tokenRepo.findByTokenHash(DigestUtils.sha256Hex(req.token()))
                .orElseThrow(() -> new EntityNotFoundException("Token no encontrado"));

//        if(token.isExpired() || token.isUsed()) return new CredentialExpiredException("Token no válido");
        UserEntity user = token.getUser();
        String hashedBtn = passwordEncoder.encode(req.password());
        user.setPassword(hashedBtn);
        user.setEnabled(true);

        userRepo.save(user);

        token.setUsed(true);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        UserEntity user = userRepo.findByLegajoWithDepartamentos(req.legajo())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        Set<String> emails = user.getDepartamentos().stream()
                .map(UsuarioDepartamentoEntity::getEmail)
                .collect(Collectors.toSet());


        PasswordTokenEntity token = new PasswordTokenEntity();
        token.setUser(user);
        String rawToken = generateRawToken();
        String hashedToken = DigestUtils.sha256Hex(rawToken);
        token.setTokenHash(hashedToken);
        token.setType(TokenType.RESET_PASSWORD);
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsed(false);

        tokenRepository.save(token);

        for(String e : emails){
            emailService.sendEmailRecuperarPassword(e, rawToken);
        }
    }

    public String generateRawToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

}

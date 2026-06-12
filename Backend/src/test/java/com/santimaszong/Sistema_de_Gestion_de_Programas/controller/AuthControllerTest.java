package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.ForgotPasswordRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.LoginRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.gemini.GeminiService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.pdf.PdfGeneratorService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.seeder.DatabaseSeeder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests de integración HTTP para AuthController.
 *
 * Cubre: login exitoso, login fallido, /me y forgot-password.
 * Misma estrategia de mocks que ProgramaControllerTest para compartir el contexto de Spring.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PasswordEncoder passwordEncoder;

    @Autowired private UserRepository userRepository;
    @Autowired private DepartamentoRepository deptRepository;
    @Autowired private UsuarioDepartamentoRepository udeRepository;

    @MockBean private EmailService emailService;
    @MockBean private GeminiService geminiService;
    @MockBean private PdfGeneratorService pdfGeneratorService;
    @MockBean private DatabaseSeeder databaseSeeder;

    private static final String TEST_LEGAJO   = "auth-test-user";
    private static final String TEST_PASSWORD = "testpass123";

    private UserEntity testUser;
    private DepartamentoEntity dept;

    @BeforeEach
    void setUp() {
        // Usuario habilitado con contraseña BCrypt conocida
        testUser = new UserEntity();
        testUser.setNombre("Test");
        testUser.setApellido("Auth");
        testUser.setLegajo(TEST_LEGAJO);
        testUser.setPassword(passwordEncoder.encode(TEST_PASSWORD));
        testUser.setEnabled(true);
        testUser = userRepository.save(testUser);

        // Departamento y UDE necesarios para /me (carga departamentos via fetchjoin)
        dept = new DepartamentoEntity();
        dept.setNombre("Dept Auth Test");
        dept.setDireccion("Calle Test 1");
        dept.setTelefono("291-0000001");
        dept.setEmail("dept-auth@uns-test.edu.ar");
        dept = deptRepository.save(dept);

        UsuarioDepartamentoEntity ude = new UsuarioDepartamentoEntity();
        ude.setUsuario(testUser);
        ude.setDepartamento(dept);
        ude.setEmail(TEST_LEGAJO + "@uns-test.edu.ar");
        ude.setRoles(new HashSet<>(Set.of(Rol.ADMINISTRACION)));
        udeRepository.save(ude);

        userRepository.flush();
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 1 – POST /auth/login con credenciales correctas → 200 + token
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void login_givenValidCredentials_whenPost_thenReturns200WithToken() throws Exception {
        // Given
        LoginRequest req = new LoginRequest(TEST_LEGAJO, TEST_PASSWORD);

        // When / Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 2 – POST /auth/login con contraseña incorrecta
    //          → 5xx (BadCredentialsException capturado por handleGeneralException)
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void login_givenWrongPassword_whenPost_thenReturnsError() throws Exception {
        // Given
        LoginRequest req = new LoginRequest(TEST_LEGAJO, "wrong-password");

        // When / Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is5xxServerError());
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 3 – GET /auth/me con usuario autenticado → 200 + datos del usuario
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void me_givenAuthenticatedUser_whenGet_thenReturns200WithUserData() throws Exception {
        // Given – user(testUser) setea SecurityContext, auth.getName() = testUser.getLegajo()
        mockMvc.perform(get("/api/auth/me")
                        .with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.legajo").value(TEST_LEGAJO));
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 4 – GET /auth/me sin autenticación → 4xx
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void me_givenNoAuthentication_whenGet_thenReturns4xx() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().is4xxClientError());
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 5 – POST /auth/forgot-password con legajo válido → 200
    //          (emailService está mockeado, no se envía email real)
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void forgotPassword_givenValidLegajo_whenPost_thenReturns200() throws Exception {
        // Given
        ForgotPasswordRequest req = new ForgotPasswordRequest(TEST_LEGAJO);

        // When / Then
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.AccionPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests de integración HTTP para ProgramaController.
 *
 * Estrategia:
 * - @SpringBootTest(webEnvironment = MOCK) + @AutoConfigureMockMvc: stack HTTP completo contra H2.
 * - @Transactional: cada test vive en su propia transacción que se revierte al finalizar.
 * - SecurityMockMvcRequestPostProcessors.user(): pre-setea el SecurityContext, saltea el JwtFilter.
 * - @MockBean DatabaseSeeder: impide que el seeder inserte datos en H2 al arrancar.
 * - @MockBean EmailService / GeminiService / PdfGeneratorService: evita llamadas a APIs externas.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Transactional
class ProgramaControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    // ── Repositorios para setup de datos ──────────────────────────────────
    @Autowired private DepartamentoRepository deptRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private UsuarioDepartamentoRepository udeRepository;
    @Autowired private MateriaRepository materiaRepository;
    @Autowired private CarreraRepository carreraRepository;
    @Autowired private CarreraPlanRepository planRepository;
    @Autowired private ProgramaRepository programaRepository;

    // ── Mocks para side effects externos ──────────────────────────────────
    @MockBean private EmailService emailService;
    @MockBean private GeminiService geminiService;
    @MockBean private PdfGeneratorService pdfGeneratorService;
    @MockBean private DatabaseSeeder databaseSeeder;

    // ── Entidades de test compartidas ─────────────────────────────────────
    private DepartamentoEntity dept;
    private MateriaEntity materia;
    private UserEntity adminUser;
    private UserEntity docenteUser;
    private UserEntity secretariaUser;
    private UsuarioDepartamentoEntity udeAdmin;
    private UsuarioDepartamentoEntity udeDocente;
    private UsuarioDepartamentoEntity udeSecretaria;
    private CarreraPlanEntity plan;

    // ═════════════════════════════════════════════════════════════════════
    // SETUP
    // ═════════════════════════════════════════════════════════════════════

    @BeforeEach
    void setUp() {
        dept = new DepartamentoEntity();
        dept.setNombre("Dept Ctrl Test");
        dept.setDireccion("Calle Test 123");
        dept.setTelefono("291-0000000");
        dept.setEmail("dept-ctrl@uns-test.edu.ar");
        dept = deptRepository.save(dept);

        adminUser    = saveUser("admin-ctrl");
        docenteUser  = saveUser("docente-ctrl");
        secretariaUser = saveUser("secre-ctrl");
        UserEntity coordUser = saveUser("coord-ctrl");

        udeAdmin     = saveUde(dept, adminUser,     Rol.ADMINISTRACION);
        udeDocente   = saveUde(dept, docenteUser,   Rol.DOCENTE);
        udeSecretaria = saveUde(dept, secretariaUser, Rol.SECRETARIA);
        UsuarioDepartamentoEntity udeCoord = saveUde(dept, coordUser, Rol.COORDINACION_COMISION_CURRICULAR);

        materia = new MateriaEntity();
        materia.setNombre("Cálculo I");
        materia.setCodigo("CALC-CTRL-001");
        materia.setDepartamento(dept);
        materia = materiaRepository.save(materia);

        CarreraEntity carrera = new CarreraEntity();
        carrera.setNombre("Ing Civil Ctrl Test");
        carrera.setDuracion("5 años");
        carrera.setDepartamento(dept);
        carrera.setComision(udeCoord);
        carrera = carreraRepository.save(carrera);

        plan = new CarreraPlanEntity();
        plan.setAnio("2020");
        plan.setVersion(1);
        plan.setCarrera(carrera);
        plan = planRepository.save(plan);

        // Flush para que todos los datos estén en H2 antes de las queries del service
        materiaRepository.flush();
    }

    private UserEntity saveUser(String legajoPrefix) {
        UserEntity u = new UserEntity();
        u.setNombre("Test");
        u.setApellido("User");
        u.setLegajo(legajoPrefix);
        u.setEnabled(true);
        return userRepository.save(u);
    }

    private UsuarioDepartamentoEntity saveUde(DepartamentoEntity dept, UserEntity user, Rol... roles) {
        UsuarioDepartamentoEntity ude = new UsuarioDepartamentoEntity();
        ude.setUsuario(user);
        ude.setDepartamento(dept);
        ude.setEmail(user.getLegajo() + "@uns-test.edu.ar");
        ude.setRoles(new HashSet<>(Arrays.asList(roles)));
        return udeRepository.save(ude);
    }

    /** Construye un ProgramaCargaDTO con todos los campos completos. */
    private ProgramaCargaDTO buildCargaDTOComplete() {
        ProgramaCarreraCreateDTO bloque = new ProgramaCarreraCreateDTO();
        bloque.setCarreraPlanId(plan.getId());
        bloque.setUbicacionEnPlan("3er año");
        bloque.setCorrelativasFuertesIds(List.of());
        bloque.setCorrelativasDebilesIds(List.of());
        bloque.setContribucion("Contribuye al perfil");
        bloque.setContenidosMinimos("Contenidos mínimos requeridos");

        ProgramaCargaDTO dto = new ProgramaCargaDTO();
        dto.setMateriaId(materia.getId());
        dto.setProfesorResponsableId(docenteUser.getId());
        dto.setBloqueMultiple(List.of(bloque));
        dto.setCargaHorariaTotal(64);
        dto.setCargaHorariaSemanal(4);
        dto.setCreditos(4);
        dto.setCantidadSemanas(16);
        return dto;
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 1 – POST /departamentos/{id}/programas
    //          Admin con todos los campos → 201 + estado COMPLETO_POR_ADMINISTRACION
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void createPrograma_givenAdminActorWithAllFields_whenPost_thenReturns201AndCompletoPorAdministracion()
            throws Exception {

        // Given
        String body = objectMapper.writeValueAsString(buildCargaDTOComplete());

        // When / Then
        mockMvc.perform(post("/api/departamentos/{deptId}/programas", dept.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(user(adminUser)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("COMPLETO_POR_ADMINISTRACION"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.anio").isNumber());
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 2 – POST: admin sin bloques → 201 + estado INCOMPLETO_POR_ADMINISTRACION
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void createPrograma_givenAdminActorWithNoBloques_whenPost_thenReturns201AndIncompletoPorAdministracion()
            throws Exception {

        // Given – DTO sin bloqueMultiple
        ProgramaCargaDTO dto = new ProgramaCargaDTO();
        dto.setMateriaId(materia.getId());
        dto.setProfesorResponsableId(docenteUser.getId());
        dto.setBloqueMultiple(List.of());
        dto.setCargaHorariaTotal(64);
        dto.setCargaHorariaSemanal(4);
        dto.setCreditos(4);
        dto.setCantidadSemanas(16);

        // When / Then
        mockMvc.perform(post("/api/departamentos/{deptId}/programas", dept.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .with(user(adminUser)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("INCOMPLETO_POR_ADMINISTRACION"));
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 3 – POST sin autenticación → 401 / 403
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void createPrograma_givenNoAuthentication_whenPost_thenReturns4xx() throws Exception {
        // Given
        String body = objectMapper.writeValueAsString(buildCargaDTOComplete());

        // When / Then – Spring Security rechaza sin autenticación
        mockMvc.perform(post("/api/departamentos/{deptId}/programas", dept.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().is4xxClientError());
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 4 – POST con usuario que tiene rol DOCENTE como actor (no ADMINISTRACION)
    //          → 400 BadRequest (IllegalStateException del servicio)
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void createPrograma_givenDocenteActorWithoutAdminRole_whenPost_thenReturns400WithErrorMessage()
            throws Exception {

        // Given – docenteUser solo tiene rol DOCENTE en el departamento
        String body = objectMapper.writeValueAsString(buildCargaDTOComplete());

        // When / Then
        mockMvc.perform(post("/api/departamentos/{deptId}/programas", dept.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(user(docenteUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.Error").value(
                        org.hamcrest.Matchers.containsString("ADMINISTRATIVO")));
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 5 – GET /programas/{id} → 200 con el programa
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void getPrograma_givenExistingPrograma_whenGet_thenReturns200WithBody() throws Exception {
        // Given – programa persistido directamente
        ProgramaEntity p = new ProgramaEntity();
        p.setAnio(2025);
        p.setMateria(materia);
        p.setProfesorResponsable(udeDocente);
        p.setEstadoActual(EstadoPrograma.COMPLETO_POR_ADMINISTRACION);
        p = programaRepository.saveAndFlush(p);

        // When / Then
        mockMvc.perform(get("/api/programas/{id}", p.getId())
                        .with(user(adminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(p.getId()))
                .andExpect(jsonPath("$.anio").value(2025))
                .andExpect(jsonPath("$.estado").value("COMPLETO_POR_ADMINISTRACION"));
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 6 – GET /programas/{id} con id inexistente → 404
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void getPrograma_givenNonExistingId_whenGet_thenReturns404() throws Exception {
        // When / Then
        mockMvc.perform(get("/api/programas/{id}", 999_999L)
                        .with(user(adminUser)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Resource not found"));
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 7 – PATCH /estado: secretaria APRUEBA programa en APROBADO_POR_COMISION
    //          → 200 + estado APROBADO_POR_SECRETARIA
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void actualizarEstado_givenSecretariaApproves_whenPatch_thenReturns200AndAprobadoPorSecretaria()
            throws Exception {

        // Given – programa en el estado previo a la aprobación por secretaría
        ProgramaEntity p = new ProgramaEntity();
        p.setAnio(2025);
        p.setMateria(materia);
        p.setProfesorResponsable(udeDocente);
        p.registrarNuevoEstado(EstadoPrograma.APROBADO_POR_COMISION, udeAdmin, Rol.ADMINISTRACION, null);
        p = programaRepository.saveAndFlush(p);

        EstadoUpdateDTO dto = new EstadoUpdateDTO();
        dto.setAccion(AccionPrograma.APROBAR);

        // When / Then – la secretaria aprueba vía su legajo en el SecurityContext
        mockMvc.perform(patch("/api/departamentos/{deptId}/programas/{id}/estado",
                                dept.getId(), p.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .param("rolActivo", "SECRETARIA")
                        .with(user(secretariaUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("APROBADO_POR_SECRETARIA"));
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 8 – GET /departamentos/{id}/programas?rolActivo=DOCENTE
    //          → 200 con lista (vacía o con programas del docente)
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void listProgramas_givenDocenteRole_whenGet_thenReturns200WithList() throws Exception {
        // When / Then
        mockMvc.perform(get("/api/departamentos/{deptId}/programas", dept.getId())
                        .param("rolActivo", "DOCENTE")
                        .with(user(docenteUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.AccionPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.auth.JwtService;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests de integración HTTP con JWT real para ProgramaController.
 *
 * Diferencias respecto a ProgramaControllerTest:
 * - Usa tokens JWT generados por el JwtService real (no SecurityMockMvcRequestPostProcessors.user()).
 * - El JwtAuthenticationFilter valida el token, carga el usuario de H2 y setea el SecurityContext.
 * - Cubre escenarios que requieren el pipeline de seguridad completo:
 *   401 (sin token), 403 (rol incorrecto → AccessDeniedException), listado filtrado por coordinador.
 *
 * Perfil "test": carga application-test.properties (H2 independiente del pool del perfil genérico).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProgramaControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtService jwtService; // REAL – no mockeado

    // ── Repositorios para setup de datos ──────────────────────────────────
    @Autowired private DepartamentoRepository deptRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private UsuarioDepartamentoRepository udeRepository;
    @Autowired private MateriaRepository materiaRepository;
    @Autowired private CarreraRepository carreraRepository;
    @Autowired private CarreraPlanRepository planRepository;
    @Autowired private ProgramaRepository programaRepository;
    @Autowired private DecisionComisionRepository decisionRepository;

    // ── Mocks para side effects externos ──────────────────────────────────
    @MockBean private EmailService emailService;
    @MockBean private GeminiService geminiService;
    @MockBean private PdfGeneratorService pdfGeneratorService;
    @MockBean private DatabaseSeeder databaseSeeder;

    // ── Entidades del test ────────────────────────────────────────────────
    private DepartamentoEntity dept;
    private MateriaEntity materia;
    private UserEntity adminUser;
    private UserEntity coordUser;
    private UserEntity docenteUser;
    private UsuarioDepartamentoEntity udeAdmin;
    private UsuarioDepartamentoEntity udeCoord;
    private UsuarioDepartamentoEntity udeDocente;
    private CarreraPlanEntity plan;

    // ── JWT tokens generados por el JwtService real ───────────────────────
    private String adminToken;
    private String coordToken;

    // ═════════════════════════════════════════════════════════════════════
    // SETUP
    // ═════════════════════════════════════════════════════════════════════

    @BeforeEach
    void setUp() {
        dept = new DepartamentoEntity();
        dept.setNombre("Dept Integ Test");
        dept.setDireccion("Integ 123");
        dept.setTelefono("291-9999999");
        dept.setEmail("dept-integ@uns-test.edu.ar");
        dept = deptRepository.save(dept);

        adminUser   = saveUser("admin-integ");
        coordUser   = saveUser("coord-integ");
        docenteUser = saveUser("docente-integ");

        udeAdmin   = saveUde(dept, adminUser,   Rol.ADMINISTRACION);
        udeCoord   = saveUde(dept, coordUser,   Rol.COORDINACION_COMISION_CURRICULAR);
        udeDocente = saveUde(dept, docenteUser, Rol.DOCENTE);

        materia = new MateriaEntity();
        materia.setNombre("Mecánica Racional");
        materia.setCodigo("MEC-INTEG-001");
        materia.setDepartamento(dept);
        materia = materiaRepository.save(materia);

        CarreraEntity carrera = new CarreraEntity();
        carrera.setNombre("Ing Mecánica Integ Test");
        carrera.setDuracion("5 años");
        carrera.setDepartamento(dept);
        carrera.setComision(udeCoord);
        carrera = carreraRepository.save(carrera);

        plan = new CarreraPlanEntity();
        plan.setAnio("2020");
        plan.setVersion(1);
        plan.setCarrera(carrera);
        plan = planRepository.save(plan);

        // Flush para que JPQL encuentre los datos antes de que el service consulte
        materiaRepository.flush();

        // Generar JWT reales usando el JwtService (con el secret del application-test.properties)
        adminToken = jwtService.generateToken(adminUser.getLegajo());
        coordToken = jwtService.generateToken(coordUser.getLegajo());
    }

    private UserEntity saveUser(String legajo) {
        UserEntity u = new UserEntity();
        u.setNombre("Test");
        u.setApellido("Integ");
        u.setLegajo(legajo);
        u.setEnabled(true);
        return userRepository.save(u);
    }

    private UsuarioDepartamentoEntity saveUde(DepartamentoEntity dept, UserEntity user, Rol... roles) {
        UsuarioDepartamentoEntity ude = new UsuarioDepartamentoEntity();
        ude.setUsuario(user);
        ude.setDepartamento(dept);
        ude.setEmail(user.getLegajo() + "@uns-integ.edu.ar");
        ude.setRoles(new HashSet<>(Arrays.asList(roles)));
        return udeRepository.save(ude);
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 1 – POST con JWT válido y rol ADMINISTRACION
    //          → 201 + estado INCOMPLETO_POR_ADMINISTRACION o COMPLETO_POR_ADMINISTRACION
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void createPrograma_givenValidJwtAndAdminRole_whenPost_thenReturns201WithEstado() throws Exception {
        // Given – DTO con todos los campos; el bloque hace que quede COMPLETO
        ProgramaCarreraCreateDTO bloque = new ProgramaCarreraCreateDTO();
        bloque.setCarreraPlanId(plan.getId());
        bloque.setUbicacionEnPlan("3er año");
        bloque.setCorrelativasFuertesIds(List.of());
        bloque.setCorrelativasDebilesIds(List.of());
        bloque.setContribucion("Contribuye al perfil");
        bloque.setContenidosMinimos("Contenidos mínimos");

        ProgramaCargaDTO dto = new ProgramaCargaDTO();
        dto.setMateriaId(materia.getId());
        dto.setProfesorResponsableId(docenteUser.getId());
        dto.setBloqueMultiple(List.of(bloque));
        dto.setCargaHorariaTotal(64);
        dto.setCargaHorariaSemanal(4);
        dto.setCreditos(4);
        dto.setCantidadSemanas(16);

        // When – token real en Authorization header, JwtAuthenticationFilter lo valida
        mockMvc.perform(post("/api/departamentos/{deptId}/programas", dept.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                // Then
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.anio").isNumber())
                .andExpect(jsonPath("$.estado").value(
                        org.hamcrest.Matchers.anyOf(
                                org.hamcrest.Matchers.is("COMPLETO_POR_ADMINISTRACION"),
                                org.hamcrest.Matchers.is("INCOMPLETO_POR_ADMINISTRACION")
                        )));
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 2 – POST sin JWT → 401 Unauthorized
    //          (SecurityConfig con HttpStatusEntryPoint(UNAUTHORIZED) → 401)
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void createPrograma_givenNoJwt_whenPost_thenReturns401() throws Exception {
        ProgramaCargaDTO dto = new ProgramaCargaDTO();
        dto.setMateriaId(materia.getId());
        dto.setBloqueMultiple(List.of());

        // Sin header Authorization → JwtFilter no setea SecurityContext → Spring Security rechaza
        mockMvc.perform(post("/api/departamentos/{deptId}/programas", dept.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 3 – PATCH /estado con JWT válido pero el UDE del actor no tiene el rol requerido
    //          → 403 Forbidden (AccessDeniedException → GlobalExceptionHandler)
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void actualizarEstado_givenUserWithoutRequiredRole_whenPatch_thenReturns403() throws Exception {
        // Given – adminUser tiene ADMINISTRACION, pero se pasa rolActivo=SECRETARIA
        // La validación en el service: if rolActivo=SECRETARIA AND !hasRole(SECRETARIA) → AccessDeniedException
        EstadoUpdateDTO dto = new EstadoUpdateDTO();
        dto.setAccion(AccionPrograma.APROBAR);

        // El programaId no importa: AccessDeniedException se lanza ANTES del findById
        mockMvc.perform(patch("/api/departamentos/{deptId}/programas/{id}/estado",
                                dept.getId(), 999_999L)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .param("rolActivo", "SECRETARIA"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Access denied"));
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 4 – GET /departamentos/{id}/programas/pendientes con rol COORDINACION
    //          → 200 + lista filtrada solo con programas pendientes del coordinador
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void listPendientes_givenCoordinadorJwt_whenGet_thenReturns200WithFilteredList() throws Exception {
        // Given – programa en COMPLETO_POR_PROFESOR con bloque en la carrera del coordinador
        //         y una DecisionComisionEntity pendiente (aprobado=false)
        ProgramaEntity programa = new ProgramaEntity();
        programa.setAnio(LocalDate.now().getYear()); // el service usa el año actual
        programa.setMateria(materia);
        programa.setProfesorResponsable(udeDocente);
        programa.registrarNuevoEstado(
                EstadoPrograma.COMPLETO_POR_PROFESOR, udeAdmin, Rol.ADMINISTRACION, null);

        // Bloque que conecta el programa con la carrera cuyo coordinador es coordUser
        ProgramaCarreraEntity bloque = new ProgramaCarreraEntity();
        bloque.setCarreraPlan(plan); // plan.carrera.comision = udeCoord (legajo = "coord-integ")
        bloque.setCorrelativasFuertes(new ArrayList<>());
        bloque.setCorrelativasDebiles(new ArrayList<>());
        bloque.setPrograma(programa);
        programa.getBloqueMultiple().add(bloque);

        programaRepository.saveAndFlush(programa); // cascade guarda el bloque también

        // Decisión pendiente: aprobado=false → el coordinador aún no resolvió
        DecisionComisionEntity decision = new DecisionComisionEntity();
        decision.setProgramaCarrera(bloque);
        decision.setAprobado(false);
        decisionRepository.saveAndFlush(decision);

        // When – coordToken autentica a coordUser; auth.getName() = "coord-integ"
        mockMvc.perform(get("/api/departamentos/{deptId}/programas/pendientes", dept.getId())
                        .header("Authorization", "Bearer " + coordToken)
                        .param("rolActivo", "COORDINACION_COMISION_CURRICULAR"))
                // Then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(programa.getId()));
    }
}

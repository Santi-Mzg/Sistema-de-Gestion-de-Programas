package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.AccionPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para ProgramaServiceImpl.
 *
 * Estrategia: @ExtendWith(MockitoExtension) con STRICT_STUBS por defecto.
 * Todos los colaboradores están mockeados; EmailService nunca envía emails reales.
 *
 * Nomenclatura de métodos: <método>_given<condición>_when<acción>_then<resultado>
 */
@ExtendWith(MockitoExtension.class)
class ProgramaServiceImplTest {

    // ── Repositories ──────────────────────────────────────────────────────
    @Mock private ProgramaRepository programaRepository;
    @Mock private ProgramaCarreraRepository programaCarreraRepository;
    @Mock private ProgramaDraftRepository draftRepository;
    @Mock private DecisionComisionRepository decisionRepository;

    // ── Services ──────────────────────────────────────────────────────────
    @Mock private MateriaService materiaService;
    @Mock private UserService userService;
    @Mock private CarreraService carreraService;
    @Mock private UsuarioDepartamentoService udeService;
    @Mock private EmailService emailService;

    // ── Mappers ───────────────────────────────────────────────────────────
    @Mock private ProgramaResponseMapper responseMapper;
    @Mock private ProgramaResponseReducedMapper responseReducedMapper;
    @Mock private ProgramaCargaMapper cargaMapper;
    @Mock private ProgramaCarreraMapper programaCarreraMapper;

    @InjectMocks private ProgramaServiceImpl service;

    // ── Auth (parámetro de método, no inyectado en el service) ────────────
    @Mock private Authentication auth;

    // ═════════════════════════════════════════════════════════════════════
    // FIXTURE HELPERS
    // ═════════════════════════════════════════════════════════════════════

    private UserEntity buildUser(Long id, String legajo) {
        UserEntity u = new UserEntity();
        u.setId(id);
        u.setNombre("Juan");
        u.setApellido("Perez");
        u.setLegajo(legajo);
        u.setEnabled(true);
        return u;
    }

    private UsuarioDepartamentoEntity buildUde(Long id, UserEntity user, Rol... roles) {
        UsuarioDepartamentoEntity ude = new UsuarioDepartamentoEntity();
        ude.setId(id);
        ude.setUsuario(user);
        ude.setEmail("ude_" + id + "@uns.edu.ar");
        ude.setRoles(new HashSet<>(Arrays.asList(roles)));
        return ude;
    }

    /**
     * Crea un DepartamentoEntity cuya lista interna de usuarios ya incluye
     * a la secretaria, de modo que getSecretaria() devuelve ese UDE.
     */
    private DepartamentoEntity buildDeptWithSecretaria(UsuarioDepartamentoEntity secretariaUde) {
        DepartamentoEntity dept = new DepartamentoEntity();
        dept.setId(1L);
        dept.setNombre("Departamento de Ingeniería");
        dept.setDireccion("Alem 1253");
        dept.setTelefono("291-4595101");
        dept.setEmail("dept@uns.edu.ar");
        // getUsuarios() devuelve el ArrayList inicializado por el field initializer
        dept.getUsuarios().add(secretariaUde);
        return dept;
    }

    private MateriaEntity buildMateria(Long id, DepartamentoEntity dept) {
        MateriaEntity m = new MateriaEntity();
        m.setId(id);
        m.setNombre("Análisis Matemático");
        m.setCodigo("MAT101");
        m.setDepartamento(dept);
        return m;
    }

    /**
     * Crea un CarreraPlanEntity con su CarreraEntity que tiene la comision asignada.
     * planId también se usa como carreraId para simplificar los fixtures.
     */
    private CarreraPlanEntity buildPlan(Long planId, UsuarioDepartamentoEntity comision) {
        CarreraEntity carrera = new CarreraEntity();
        carrera.setId(planId);
        carrera.setNombre("Ingeniería Civil");
        carrera.setDuracion("5 años");
        carrera.setComision(comision);

        CarreraPlanEntity plan = new CarreraPlanEntity();
        plan.setId(planId);
        plan.setAnio("2020");
        plan.setVersion(1);
        plan.setCarrera(carrera);
        return plan;
    }

    /**
     * Crea un ProgramaCarreraEntity con las listas de correlativas vacías y
     * con el plan asignado (carrera → comisión disponible para emails).
     */
    private ProgramaCarreraEntity buildBloqueEntity(CarreraPlanEntity plan) {
        ProgramaCarreraEntity bloque = new ProgramaCarreraEntity();
        bloque.setId(100L);
        bloque.setCarreraPlan(plan);
        bloque.setCorrelativasFuertes(new ArrayList<>());
        bloque.setCorrelativasDebiles(new ArrayList<>());
        bloque.setUbicacionEnPlan("3er año");
        bloque.setContenidosMinimos("Contenidos mínimos");
        return bloque;
    }

    /**
     * Construye un ProgramaEntity ya persistido por administración.
     * Llama a registrarNuevoEstado() con rol ADMINISTRACION para que
     * getAdministracionResponsable() funcione correctamente.
     */
    private ProgramaEntity buildPrograma(
            Long id,
            EstadoPrograma estado,
            UsuarioDepartamentoEntity adminUde,
            UsuarioDepartamentoEntity profesorUde,
            MateriaEntity materia,
            List<ProgramaCarreraEntity> bloques
    ) {
        ProgramaEntity p = new ProgramaEntity();
        p.setId(id);
        p.setAnio(2025);
        p.setCargaHorariaTotal(64);
        p.setCargaHorariaSemanal(4);
        p.setCreditos(4);
        p.setCantidadSemanas(16);
        p.setMateria(materia);
        p.setProfesorResponsable(profesorUde);
        p.registrarNuevoEstado(estado, adminUde, Rol.ADMINISTRACION, null);
        if (bloques != null) {
            p.setBloqueMultiple(new ArrayList<>(bloques));
        }
        return p;
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 1a – create(): admin con TODOS los campos cargados
    //           → estado COMPLETO_POR_ADMINISTRACION
    //           → emailService.sendEmailNotificacionCargaAdministrativo llamado
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void create_givenAdminActorWithAllFields_whenCreate_thenStateIsCompletoPorAdministracionAndEmailSent() {
        // Given
        Long deptId = 1L;
        Long materiaId = 2L;
        Long profesorId = 3L;

        UserEntity adminUser = buildUser(1L, "admin001");
        UserEntity profesorUser = buildUser(profesorId, "prof001");
        UsuarioDepartamentoEntity udeAdmin = buildUde(10L, adminUser, Rol.ADMINISTRACION);
        UsuarioDepartamentoEntity udeProfesor = buildUde(20L, profesorUser, Rol.DOCENTE);

        DepartamentoEntity dept = buildDeptWithSecretaria(udeAdmin);
        MateriaEntity materia = buildMateria(materiaId, dept);
        CarreraPlanEntity plan = buildPlan(1L, udeAdmin);

        ProgramaCarreraCreateDTO bloqueDto = new ProgramaCarreraCreateDTO();
        bloqueDto.setCarreraPlanId(1L);
        bloqueDto.setUbicacionEnPlan("3er año");
        bloqueDto.setCorrelativasFuertesIds(List.of());
        bloqueDto.setCorrelativasDebilesIds(List.of());

        ProgramaCargaDTO dto = new ProgramaCargaDTO();
        dto.setMateriaId(materiaId);
        dto.setProfesorResponsableId(profesorId);
        dto.setBloqueMultiple(List.of(bloqueDto));
        dto.setCargaHorariaTotal(64);
        dto.setCargaHorariaSemanal(4);
        dto.setCreditos(4);
        dto.setCantidadSemanas(16);

        // El mapper devuelve una entidad con los 4 campos numéricos ya asignados
        ProgramaEntity mappedEntity = new ProgramaEntity();
        mappedEntity.setCargaHorariaTotal(64);
        mappedEntity.setCargaHorariaSemanal(4);
        mappedEntity.setCreditos(4);
        mappedEntity.setCantidadSemanas(16);

        ProgramaCarreraEntity bloqueEntity = new ProgramaCarreraEntity();
        bloqueEntity.setCorrelativasFuertes(new ArrayList<>());
        bloqueEntity.setCorrelativasDebiles(new ArrayList<>());

        when(programaRepository.existsByMateriaIdAndAnio(eq(materiaId), anyInt())).thenReturn(false);
        when(cargaMapper.toEntity(dto)).thenReturn(mappedEntity);
        when(materiaService.getEntityById(materiaId)).thenReturn(materia);
        when(udeService.findByUsuarioIdAndDepartamentoId(adminUser.getId(), deptId)).thenReturn(udeAdmin);
        when(udeService.findByUsuarioIdAndDepartamentoId(profesorId, deptId)).thenReturn(udeProfesor);
        when(programaCarreraMapper.toEntity(any(ProgramaCarreraCreateDTO.class))).thenReturn(bloqueEntity);
        when(carreraService.getPlanEntityById(1L)).thenReturn(plan);
        when(materiaService.listEntities(anyList())).thenReturn(List.of());
        when(programaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userService.getEntityById(profesorId)).thenReturn(profesorUser);

        // When
        service.create(deptId, dto, adminUser);

        // Then
        assertThat(mappedEntity.getEstadoActual())
                .as("Con todos los campos completos, el estado debe ser COMPLETO_POR_ADMINISTRACION")
                .isEqualTo(EstadoPrograma.COMPLETO_POR_ADMINISTRACION);
        assertThat(mappedEntity.getHistorialEstados())
                .hasSize(1);
        assertThat(mappedEntity.getHistorialEstados().get(0).getActorRol())
                .isEqualTo(Rol.ADMINISTRACION);
        verify(emailService).sendEmailNotificacionCargaAdministrativo(
                eq(udeProfesor.getEmail()), eq(profesorUser), eq(materia));
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 1b – create(): admin sin bloques de carrera
    //           → estado INCOMPLETO_POR_ADMINISTRACION
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void create_givenAdminActorWithNoBloques_whenCreate_thenStateIsIncompletoPorAdministracion() {
        // Given
        Long deptId = 1L;
        Long materiaId = 2L;
        Long profesorId = 3L;

        UserEntity adminUser = buildUser(1L, "admin001");
        UserEntity profesorUser = buildUser(profesorId, "prof001");
        UsuarioDepartamentoEntity udeAdmin = buildUde(10L, adminUser, Rol.ADMINISTRACION);
        UsuarioDepartamentoEntity udeProfesor = buildUde(20L, profesorUser, Rol.DOCENTE);

        DepartamentoEntity dept = new DepartamentoEntity();
        MateriaEntity materia = buildMateria(materiaId, dept);

        ProgramaCargaDTO dto = new ProgramaCargaDTO();
        dto.setMateriaId(materiaId);
        dto.setProfesorResponsableId(profesorId);
        dto.setBloqueMultiple(List.of()); // sin bloques → completoAdministracion = false
        dto.setCargaHorariaTotal(64);
        dto.setCargaHorariaSemanal(4);
        dto.setCreditos(4);
        dto.setCantidadSemanas(16);

        ProgramaEntity mappedEntity = new ProgramaEntity();
        mappedEntity.setCargaHorariaTotal(64);
        mappedEntity.setCargaHorariaSemanal(4);
        mappedEntity.setCreditos(4);
        mappedEntity.setCantidadSemanas(16);

        when(programaRepository.existsByMateriaIdAndAnio(eq(materiaId), anyInt())).thenReturn(false);
        when(cargaMapper.toEntity(dto)).thenReturn(mappedEntity);
        when(materiaService.getEntityById(materiaId)).thenReturn(materia);
        when(udeService.findByUsuarioIdAndDepartamentoId(adminUser.getId(), deptId)).thenReturn(udeAdmin);
        when(udeService.findByUsuarioIdAndDepartamentoId(profesorId, deptId)).thenReturn(udeProfesor);
        when(programaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userService.getEntityById(profesorId)).thenReturn(profesorUser);

        // When
        service.create(deptId, dto, adminUser);

        // Then
        assertThat(mappedEntity.getEstadoActual())
                .as("Sin bloques, el estado debe ser INCOMPLETO_POR_ADMINISTRACION")
                .isEqualTo(EstadoPrograma.INCOMPLETO_POR_ADMINISTRACION);
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 2 – create(): actor sin rol ADMINISTRACION → IllegalStateException
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void create_givenActorWithoutAdminRole_whenCreate_thenThrowsIllegalStateException() {
        // Given
        Long deptId = 1L;
        Long materiaId = 2L;

        UserEntity docenteUser = buildUser(1L, "doc001");
        UsuarioDepartamentoEntity udeDocente = buildUde(10L, docenteUser, Rol.DOCENTE);

        ProgramaCargaDTO dto = new ProgramaCargaDTO();
        dto.setMateriaId(materiaId);
        dto.setProfesorResponsableId(3L);
        dto.setBloqueMultiple(List.of());

        ProgramaEntity mappedEntity = new ProgramaEntity();

        when(programaRepository.existsByMateriaIdAndAnio(eq(materiaId), anyInt())).thenReturn(false);
        when(cargaMapper.toEntity(dto)).thenReturn(mappedEntity);
        when(materiaService.getEntityById(materiaId)).thenReturn(buildMateria(materiaId, new DepartamentoEntity()));
        when(udeService.findByUsuarioIdAndDepartamentoId(docenteUser.getId(), deptId)).thenReturn(udeDocente);

        // When / Then
        assertThatThrownBy(() -> service.create(deptId, dto, docenteUser))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ADMINISTRATIVO");
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 3 – profesorCarga(): todos los campos del profesor completos
    //          → COMPLETO_POR_PROFESOR
    //          → DecisionComisionEntity creada por cada bloque
    //          → email enviado a la comisión de cada carrera
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void profesorCarga_givenAllRequiredFields_whenCarga_thenStateIsCompletoPorProfesorAndDecisionCreatedAndEmailSent() {
        // Given
        Long deptId = 1L;
        Long programaId = 10L;

        UserEntity adminUser = buildUser(1L, "admin001");
        UserEntity profesorUser = buildUser(2L, "prof001");
        UsuarioDepartamentoEntity udeAdmin = buildUde(5L, adminUser, Rol.ADMINISTRACION);
        UsuarioDepartamentoEntity udeProfesor = buildUde(6L, profesorUser, Rol.DOCENTE);

        // La comisión de la carrera es udeAdmin (en el test no importa qué UDE sea,
        // solo que esté asignada para resolver bloque→plan→carrera→comision.email)
        DepartamentoEntity dept = buildDeptWithSecretaria(udeAdmin);
        MateriaEntity materia = buildMateria(2L, dept);
        CarreraPlanEntity plan = buildPlan(1L, udeAdmin);
        ProgramaCarreraEntity bloque = buildBloqueEntity(plan);

        ProgramaEntity existingPrograma = buildPrograma(
                programaId, EstadoPrograma.COMPLETO_POR_ADMINISTRACION,
                udeAdmin, udeProfesor, materia, List.of(bloque)
        );
        bloque.setPrograma(existingPrograma);

        // El DTO contiene todos los campos que el docente debe completar
        ProgramaCargaDTO dto = new ProgramaCargaDTO();
        dto.setCargaHorariaPractica(32);
        dto.setFundamentacion("Fundamentación completa");
        dto.setObjetivos("Objetivos claros");
        dto.setProgramaAnalitico("Programa analítico detallado");
        dto.setMetodologia("Metodología activa");
        dto.setModalidadEvaluacion("Parciales + final");
        dto.setBibliografia("Autor, A. (2024). Título.");

        when(programaRepository.findById(programaId)).thenReturn(Optional.of(existingPrograma));
        when(udeService.findByUsuarioIdAndDepartamentoId(profesorUser.getId(), deptId)).thenReturn(udeProfesor);
        when(programaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        service.profesorCarga(deptId, programaId, dto, profesorUser);

        // Then – estado pasa a COMPLETO_POR_PROFESOR
        assertThat(existingPrograma.getEstadoActual())
                .isEqualTo(EstadoPrograma.COMPLETO_POR_PROFESOR);

        // Un DecisionComisionEntity guardado por cada bloque (1 bloque → 1 decisión)
        verify(decisionRepository, times(1)).save(any(DecisionComisionEntity.class));

        // El bloque tiene su decisión asignada y en estado "pendiente" (aprobado=false)
        assertThat(bloque.getDecisionComision()).isNotNull();
        assertThat(bloque.getDecisionComision().isAprobado()).isFalse();

        // Email enviado al coordinador de la carrera asociada al bloque
        verify(emailService, times(1)).sendEmailNotificacionCargaDocente(
                eq(plan.getCarrera().getComision().getEmail()),
                eq(existingPrograma),
                eq(plan.getCarrera())
        );
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 4 – actualizarEstado(): DOCENTE con acción APROBAR
    //          → IllegalArgumentException (el docente no puede aprobar)
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void actualizarEstado_givenDocenteRoleAndAprobarAction_whenActualizarEstado_thenThrowsIllegalArgumentException() {
        // Given
        Long deptId = 1L;
        Long carreraId = 1L;
        Long programaId = 10L;

        UserEntity adminUser = buildUser(1L, "admin001");
        UserEntity profesorUser = buildUser(2L, "prof001");
        UsuarioDepartamentoEntity udeAdmin = buildUde(5L, adminUser, Rol.ADMINISTRACION);
        UsuarioDepartamentoEntity udeProfesor = buildUde(6L, profesorUser, Rol.DOCENTE);
        MateriaEntity materia = buildMateria(2L, new DepartamentoEntity());

        ProgramaEntity programa = buildPrograma(
                programaId, EstadoPrograma.COMPLETO_POR_PROFESOR,
                udeAdmin, udeProfesor, materia, List.of()
        );

        EstadoUpdateDTO estadoDto = new EstadoUpdateDTO();
        estadoDto.setAccion(AccionPrograma.APROBAR);

        when(auth.getName()).thenReturn("prof001");
        when(udeService.findByUsuarioLegajoAndDepartamentoId("prof001", deptId)).thenReturn(udeProfesor);
        when(programaRepository.findById(programaId)).thenReturn(Optional.of(programa));

        // When / Then
        assertThatThrownBy(() ->
                service.actualizarEstado(auth, deptId, carreraId, programaId, estadoDto, Rol.DOCENTE))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("DOCENTE");
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 5a – actualizarEstado(): COORDINADOR + APROBAR, quedan decisiones
    //            pendientes de otras comisiones → el estado global NO cambia
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void actualizarEstado_givenCoordinadorApprovalWithPendingDecisions_whenActualizarEstado_thenProgramaStateDoesNotChange() {
        // Given
        Long deptId = 1L;
        Long carreraId = 1L;
        Long programaId = 10L;

        UserEntity adminUser = buildUser(1L, "admin001");
        UserEntity profesorUser = buildUser(2L, "prof001");
        UserEntity coordUser = buildUser(3L, "coord001");

        UsuarioDepartamentoEntity udeAdmin = buildUde(5L, adminUser, Rol.ADMINISTRACION);
        UsuarioDepartamentoEntity udeProfesor = buildUde(6L, profesorUser, Rol.DOCENTE);
        UsuarioDepartamentoEntity udeCoord = buildUde(7L, coordUser, Rol.COORDINACION_COMISION_CURRICULAR);

        DepartamentoEntity dept = buildDeptWithSecretaria(udeAdmin);
        MateriaEntity materia = buildMateria(2L, dept);

        ProgramaEntity programa = buildPrograma(
                programaId, EstadoPrograma.COMPLETO_POR_PROFESOR,
                udeAdmin, udeProfesor, materia, new ArrayList<>()
        );

        DecisionComisionEntity decision = new DecisionComisionEntity();
        ProgramaCarreraEntity bloque = new ProgramaCarreraEntity();
        bloque.setId(100L);

        EstadoUpdateDTO estadoDto = new EstadoUpdateDTO();
        estadoDto.setAccion(AccionPrograma.APROBAR);
        estadoDto.setContribucionCarrera("Contribuye al área matemática");

        when(auth.getName()).thenReturn("coord001");
        when(udeService.findByUsuarioLegajoAndDepartamentoId("coord001", deptId)).thenReturn(udeCoord);
        when(programaRepository.findById(programaId)).thenReturn(Optional.of(programa));
        when(decisionRepository.findByProgramaIdAndCarreraIdAndComisionId(programaId, carreraId, udeCoord.getId()))
                .thenReturn(Optional.of(decision));
        when(programaCarreraRepository.findByProgramaIdAndCarreraPlanId(programaId, carreraId))
                .thenReturn(Optional.of(bloque));
        // Quedan decisiones de otras comisiones → el estado global NO debe cambiar
        when(decisionRepository.countByProgramaCarreraProgramaIdAndAprobadoFalse(programaId))
                .thenReturn(1L);
        when(programaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        service.actualizarEstado(auth, deptId, carreraId, programaId, estadoDto, Rol.COORDINACION_COMISION_CURRICULAR);

        // Then – el programa sigue en COMPLETO_POR_PROFESOR
        assertThat(programa.getEstadoActual())
                .as("Con decisiones pendientes, el estado global no debe cambiar")
                .isEqualTo(EstadoPrograma.COMPLETO_POR_PROFESOR);

        // No se notifica a la secretaría
        verify(emailService, never()).sendEmailNotificacionAprobacionComision(any(), any(), any());
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 5b – actualizarEstado(): COORDINADOR + APROBAR, última comisión
    //            pendiente (count = 0) → APROBADO_POR_COMISION + email secretaría
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void actualizarEstado_givenCoordinadorLastApproval_whenActualizarEstado_thenStateIsAprobadoPorComisionAndEmailSentToSecretaria() {
        // Given
        Long deptId = 1L;
        Long carreraId = 1L;
        Long programaId = 10L;

        UserEntity adminUser = buildUser(1L, "admin001");
        UserEntity profesorUser = buildUser(2L, "prof001");
        UserEntity coordUser = buildUser(3L, "coord001");
        UserEntity secretariaUser = buildUser(4L, "secre001");

        UsuarioDepartamentoEntity udeAdmin = buildUde(5L, adminUser, Rol.ADMINISTRACION);
        UsuarioDepartamentoEntity udeProfesor = buildUde(6L, profesorUser, Rol.DOCENTE);
        UsuarioDepartamentoEntity udeCoord = buildUde(7L, coordUser, Rol.COORDINACION_COMISION_CURRICULAR);
        UsuarioDepartamentoEntity udeSecretaria = buildUde(8L, secretariaUser, Rol.SECRETARIA);

        // El departamento debe tener una secretaria para que el email se envíe
        DepartamentoEntity dept = buildDeptWithSecretaria(udeSecretaria);
        MateriaEntity materia = buildMateria(2L, dept);

        CarreraPlanEntity plan = buildPlan(carreraId, udeCoord);
        ProgramaCarreraEntity bloque = buildBloqueEntity(plan);

        ProgramaEntity programa = buildPrograma(
                programaId, EstadoPrograma.COMPLETO_POR_PROFESOR,
                udeAdmin, udeProfesor, materia, List.of(bloque)
        );
        bloque.setPrograma(programa);

        DecisionComisionEntity decision = new DecisionComisionEntity();

        EstadoUpdateDTO estadoDto = new EstadoUpdateDTO();
        estadoDto.setAccion(AccionPrograma.APROBAR);
        estadoDto.setContribucionCarrera("Contribuye al área de estructuras");

        when(auth.getName()).thenReturn("coord001");
        when(udeService.findByUsuarioLegajoAndDepartamentoId("coord001", deptId)).thenReturn(udeCoord);
        when(programaRepository.findById(programaId)).thenReturn(Optional.of(programa));
        when(decisionRepository.findByProgramaIdAndCarreraIdAndComisionId(programaId, carreraId, udeCoord.getId()))
                .thenReturn(Optional.of(decision));
        when(programaCarreraRepository.findByProgramaIdAndCarreraPlanId(programaId, carreraId))
                .thenReturn(Optional.of(bloque));
        // Esta es la última decisión: count cae a 0 → se dispara la aprobación global
        when(decisionRepository.countByProgramaCarreraProgramaIdAndAprobadoFalse(programaId))
                .thenReturn(0L);
        when(programaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        service.actualizarEstado(auth, deptId, carreraId, programaId, estadoDto, Rol.COORDINACION_COMISION_CURRICULAR);

        // Then – el estado global pasa a APROBADO_POR_COMISION
        assertThat(programa.getEstadoActual())
                .isEqualTo(EstadoPrograma.APROBADO_POR_COMISION);
        assertThat(programa.getHistorialEstados())
                .extracting(EstadoHistoricoEntity::getEstado)
                .contains(EstadoPrograma.APROBADO_POR_COMISION);

        // Se notifica a la secretaría con su usuario y la materia
        verify(emailService).sendEmailNotificacionAprobacionComision(
                eq(udeSecretaria.getEmail()),
                eq(secretariaUser),
                eq(materia)
        );
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 6 – actualizarEstado(): SECRETARIA rechaza con destinoRechazo=DOCENTE
    //          → RECHAZADO_A_PROFESOR + email al docente con justificación
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void actualizarEstado_givenSecretariaRejectsToDocente_whenActualizarEstado_thenStateIsRechazadoAProfesorAndEmailWithJustification() {
        // Given
        Long deptId = 1L;
        Long carreraId = 1L;
        Long programaId = 10L;
        String justificacion = "Falta bibliografía actualizada posterior a 2020";

        UserEntity adminUser = buildUser(1L, "admin001");
        UserEntity profesorUser = buildUser(2L, "prof001");
        UserEntity secretariaUser = buildUser(4L, "secre001");

        UsuarioDepartamentoEntity udeAdmin = buildUde(5L, adminUser, Rol.ADMINISTRACION);
        UsuarioDepartamentoEntity udeProfesor = buildUde(6L, profesorUser, Rol.DOCENTE);
        UsuarioDepartamentoEntity udeSecretaria = buildUde(8L, secretariaUser, Rol.SECRETARIA);

        DepartamentoEntity dept = buildDeptWithSecretaria(udeSecretaria);
        MateriaEntity materia = buildMateria(2L, dept);

        ProgramaEntity programa = buildPrograma(
                programaId, EstadoPrograma.APROBADO_POR_COMISION,
                udeAdmin, udeProfesor, materia, List.of()
        );

        EstadoUpdateDTO estadoDto = new EstadoUpdateDTO();
        estadoDto.setAccion(AccionPrograma.RECHAZAR);
        estadoDto.setDestinoRechazo(Rol.DOCENTE);
        estadoDto.setJustificacion(justificacion);

        when(auth.getName()).thenReturn("secre001");
        when(udeService.findByUsuarioLegajoAndDepartamentoId("secre001", deptId)).thenReturn(udeSecretaria);
        when(programaRepository.findById(programaId)).thenReturn(Optional.of(programa));
        when(programaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        service.actualizarEstado(auth, deptId, carreraId, programaId, estadoDto, Rol.SECRETARIA);

        // Then – estado pasa a RECHAZADO_A_PROFESOR
        assertThat(programa.getEstadoActual())
                .isEqualTo(EstadoPrograma.RECHAZADO_A_PROFESOR);

        // Email al docente con el emisor, justificación y materia correctos
        verify(emailService).sendEmailNotificacionRechazo(
                eq(udeProfesor.getEmail()),
                eq(profesorUser),
                eq(Rol.SECRETARIA),
                eq(secretariaUser),
                eq(materia),
                eq(justificacion)
        );
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 7 – actualizarEstado(): RECHAZAR sin especificar destinoRechazo
    //          → IllegalArgumentException
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void actualizarEstado_givenRejectWithNullDestination_whenActualizarEstado_thenThrowsIllegalArgumentException() {
        // Given
        Long deptId = 1L;
        Long carreraId = 1L;
        Long programaId = 10L;

        UserEntity adminUser = buildUser(1L, "admin001");
        UserEntity profesorUser = buildUser(2L, "prof001");
        UserEntity secretariaUser = buildUser(4L, "secre001");

        UsuarioDepartamentoEntity udeAdmin = buildUde(5L, adminUser, Rol.ADMINISTRACION);
        UsuarioDepartamentoEntity udeProfesor = buildUde(6L, profesorUser, Rol.DOCENTE);
        UsuarioDepartamentoEntity udeSecretaria = buildUde(8L, secretariaUser, Rol.SECRETARIA);

        MateriaEntity materia = buildMateria(2L, new DepartamentoEntity());
        ProgramaEntity programa = buildPrograma(
                programaId, EstadoPrograma.APROBADO_POR_COMISION,
                udeAdmin, udeProfesor, materia, List.of()
        );

        EstadoUpdateDTO estadoDto = new EstadoUpdateDTO();
        estadoDto.setAccion(AccionPrograma.RECHAZAR);
        estadoDto.setDestinoRechazo(null); // sin destino → debe lanzar excepción

        when(auth.getName()).thenReturn("secre001");
        when(udeService.findByUsuarioLegajoAndDepartamentoId("secre001", deptId)).thenReturn(udeSecretaria);
        when(programaRepository.findById(programaId)).thenReturn(Optional.of(programa));

        // When / Then
        assertThatThrownBy(() ->
                service.actualizarEstado(auth, deptId, carreraId, programaId, estadoDto, Rol.SECRETARIA))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("destino");
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 8a – getListAnioActual(): rol DOCENTE
    //           → invoca findByProfesorResponsableUsuarioLegajoAndMateria...
    //           → NO invoca findProgramasByCoordinadorLegajoAndAnio
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void getListAnioActual_givenDocenteRole_whenGetList_thenQueriesByProfesorLegajo() {
        // Given
        Long deptId = 1L;
        String legajo = "prof001";
        UserEntity profesorUser = buildUser(2L, legajo);
        UsuarioDepartamentoEntity udeProfesor = buildUde(6L, profesorUser, Rol.DOCENTE);

        when(auth.getName()).thenReturn(legajo);
        when(udeService.findByUsuarioLegajoAndDepartamentoId(legajo, deptId)).thenReturn(udeProfesor);
        when(programaRepository.findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoIdAndAnio(
                eq(legajo), eq(deptId), anyInt()
        )).thenReturn(List.of());

        // When
        service.getListAnioActual(auth, deptId, Rol.DOCENTE);

        // Then – se usa la query específica del rol DOCENTE
        verify(programaRepository).findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoIdAndAnio(
                eq(legajo), eq(deptId), anyInt()
        );
        verify(programaRepository, never())
                .findProgramasByCoordinadorLegajoAndAnio(any(), anyInt());
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 8b – getListAnioActual(): rol COORDINACION_COMISION_CURRICULAR
    //           → invoca findProgramasByCoordinadorLegajoAndAnio
    //           → NO invoca findByProfesorResponsable...
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void getListAnioActual_givenCoordinadorRole_whenGetList_thenQueriesByCoordinadorLegajo() {
        // Given
        Long deptId = 1L;
        String legajo = "coord001";
        UserEntity coordUser = buildUser(3L, legajo);
        UsuarioDepartamentoEntity udeCoord = buildUde(7L, coordUser, Rol.COORDINACION_COMISION_CURRICULAR);

        when(auth.getName()).thenReturn(legajo);
        when(udeService.findByUsuarioLegajoAndDepartamentoId(legajo, deptId)).thenReturn(udeCoord);
        when(programaRepository.findProgramasByCoordinadorLegajoAndAnio(eq(legajo), anyInt()))
                .thenReturn(List.of());

        // When
        service.getListAnioActual(auth, deptId, Rol.COORDINACION_COMISION_CURRICULAR);

        // Then – se usa la query específica del rol COORDINACION
        verify(programaRepository).findProgramasByCoordinadorLegajoAndAnio(eq(legajo), anyInt());
        verify(programaRepository, never())
                .findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoIdAndAnio(any(), any(), any());
    }
}

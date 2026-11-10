package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.ContextoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl.ProgramaServiceImpl;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.*;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@DataJpaTest(showSql = false)
@TestPropertySource(locations = "classpath:application-ci.properties")
@ContextConfiguration(classes = DashboardPendientesIntegrationTest.Config.class)
@Import({ProgramaServiceImpl.class, ContextoPrograma.class})
class DashboardPendientesIntegrationTest {
    @Configuration
    @EnableAutoConfiguration
    @EntityScan(basePackageClasses = ProgramaEntity.class)
    @EnableJpaRepositories(basePackageClasses = ProgramaRepository.class)
    static class Config { }

    @Autowired EntityManager em;
    @Autowired ProgramaService servicio;
    @Autowired UsuarioDepartamentoRepository usuariosDepartamento;
    @MockBean MateriaService materias;
    @MockBean AreaService areas;
    @MockBean CarreraService carreras;
    @MockBean UsuarioDepartamentoService usuarios;
    @MockBean EmailService correo;
    @MockBean ProgramaWorkflowService workflow;
    @MockBean ProgramaResponseMapper completo;
    @MockBean ProgramaResponseReducedMapper reducido;
    @MockBean ProgramaCargaMapper carga;
    @MockBean ProgramaCarreraMapper bloques;

    DepartamentoEntity departamento, otroDepartamento;
    UsuarioDepartamentoEntity actor, actorOtroDepartamento, otroActor;
    AreaEntity areaPropia, otraAreaPropia, areaAjena, areaOtroDepartamento;
    final int anio = LocalDate.now().getYear();
    final Authentication auth = new UsernamePasswordAuthenticationToken("persona-prueba", null);
    final Pageable pagina = PageRequest.of(0, 10, Sort.by("id"));
    int secuencia;

    @BeforeEach
    void preparar() {
        departamento = departamento("A"); otroDepartamento = departamento("B");
        UserEntity usuario = usuario("persona-prueba");
        actor = vinculo(usuario, departamento);
        actorOtroDepartamento = vinculo(usuario, otroDepartamento);
        otroActor = vinculo(usuario("otra-persona"), departamento);
        areaPropia = area("Propia", actor); otraAreaPropia = area("Otra propia", actor);
        areaAjena = area("Ajena", otroActor); areaOtroDepartamento = area("Otro departamento", actorOtroDepartamento);
        when(usuarios.findByUsuarioLegajoAndDepartamentoId(anyString(), anyLong())).thenAnswer(inv ->
                usuariosDepartamento.findByUsuarioLegajoAndDepartamentoId(inv.getArgument(0), inv.getArgument(1)).orElseThrow());
        when(reducido.toDTO(any(ProgramaEntity.class))).thenAnswer(inv -> {
            ProgramaEntity p = inv.getArgument(0); ProgramaResponseReducedDTO dto = new ProgramaResponseReducedDTO();
            dto.setId(p.getId()); dto.setAnio(p.getAnio()); dto.setEstado(p.getEstadoActual()); return dto;
        });
        when(completo.toDTO(any(ProgramaEntity.class))).thenAnswer(inv -> {
            ProgramaEntity p = inv.getArgument(0); ProgramaResponseDTO dto = new ProgramaResponseDTO();
            dto.setId(p.getId()); dto.setAnio(p.getAnio()); dto.setEstado(p.getEstadoActual()); return dto;
        });
    }

    @ParameterizedTest
    @EnumSource(value = Rol.class, names = {"ADMINISTRACION", "DOCENTE", "SECRETARIA", "COORDINADOR_AREA"})
    void pendientesExcluyenOtrosAniosDepartamentosYEstados(Rol rol) {
        EstadoPrograma estado = switch (rol) {
            case ADMINISTRACION -> EstadoPrograma.RECHAZADO_A_ADMINISTRACION;
            case DOCENTE -> EstadoPrograma.PENDIENTE_DE_DOCENTE;
            case SECRETARIA -> EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL;
            default -> EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA;
        };
        ProgramaEntity esperado = programa(anio, estado, areaPropia, actor);
        programa(anio - 1, estado, areaPropia, actor);
        programa(anio + 1, estado, areaPropia, actor);
        programa(anio, estado, areaOtroDepartamento, actorOtroDepartamento);
        programa(anio, EstadoPrograma.APROBADO, areaPropia, actor);
        em.flush();
        Page<ProgramaResponseReducedDTO> resultado = pendientes(rol);
        assertThat(resultado.getContent()).extracting(ProgramaResponseReducedDTO::getId).containsExactly(esperado.getId());
        assertThat(resultado.getTotalElements()).isEqualTo(1);
    }

    @Test
    void areaIncluyeTodasSusAreasPeroNoLasDeOtroCoordinador() {
        ProgramaEntity primero = programa(anio, EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA, areaPropia, actor);
        ProgramaEntity segundo = programa(anio, EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA, otraAreaPropia, otroActor);
        programa(anio, EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA, areaAjena, actor);
        em.flush();
        Page<ProgramaResponseReducedDTO> resultado = servicio.getListPendientes(auth, departamento.getId(), Rol.COORDINADOR_AREA,
                PageRequest.of(1, 1, pagina.getSort()));
        assertThat(resultado.getTotalElements()).isEqualTo(2);
        assertThat(resultado.getTotalPages()).isEqualTo(2);
        assertThat(resultado.getContent()).extracting(ProgramaResponseReducedDTO::getId).containsExactly(segundo.getId());
        assertThat(primero.getId()).isNotEqualTo(segundo.getId());
    }

    @Test
    void docenteNoRecibeProgramasDeOtroResponsableAunqueCompartanArea() {
        programa(anio, EstadoPrograma.PENDIENTE_DE_DOCENTE, areaPropia, otroActor);
        em.flush();
        assertThat(pendientes(Rol.DOCENTE)).isEmpty();
    }

    @ParameterizedTest
    @EnumSource(value = Rol.class, names = {"DIRECCION_ADMINISTRATIVA", "SYSTEM_ADMIN", "COORDINACION_COMISION_CURRICULAR"})
    void listadoGenericoRechazaRolesSinBandejaPropiaEnEseEndpoint(Rol rol) {
        programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaOtroDepartamento, actorOtroDepartamento); em.flush();
        assertThatThrownBy(() -> pendientes(rol)).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void cccSoloRecibeDecisionesPendientesDeLaRondaActualDeSuVinculoActivo() {
        ProgramaEntity esperado = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaOtroDepartamento, actorOtroDepartamento);
        decision(esperado, actor, 2, ResultadoDecisionComision.PENDIENTE);
        // Dos carreras asignadas dentro del mismo programa siguen contando como un programa.
        decision(esperado, actor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity yaDecidio = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        decision(yaDecidio, actor, 1, ResultadoDecisionComision.PENDIENTE);
        decision(yaDecidio, actor, 2, ResultadoDecisionComision.APROBADA);
        decision(yaDecidio, otroActor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity otroVinculo = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        decision(otroVinculo, actorOtroDepartamento, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity anterior = programa(anio - 1, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        decision(anterior, actor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity futuro = programa(anio + 1, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        decision(futuro, actor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity fueraDeEtapa = programa(anio, EstadoPrograma.RECHAZADO_A_DOCENTE, areaPropia, actor);
        decision(fueraDeEtapa, actor, 2, ResultadoDecisionComision.PENDIENTE);
        for (ResultadoDecisionComision cerrada : List.of(ResultadoDecisionComision.CANCELADA, ResultadoDecisionComision.RECHAZADA)) {
            ProgramaEntity cerrado = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
            decision(cerrado, actor, 2, cerrada);
        }
        em.flush();
        Page<ProgramaResponseDTO> resultado = servicio.getListPendientesCoordinador(auth, departamento.getId(), Rol.COORDINACION_COMISION_CURRICULAR, pagina);
        assertThat(resultado.getContent()).extracting(ProgramaResponseDTO::getId).containsExactly(esperado.getId());
        assertThat(resultado.getTotalElements()).isEqualTo(1);
    }

    @Test
    void resumenAreaCuentaCadaEtapaSoloEnSusAreasYAnioActual() {
        for (EstadoPrograma estado : List.of(EstadoPrograma.RECHAZADO_A_ADMINISTRACION, EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL,
                EstadoPrograma.RECHAZADO_A_SECRETARIA, EstadoPrograma.PENDIENTE_DE_DOCENTE, EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA,
                EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL, EstadoPrograma.APROBADO)) {
            programa(anio, estado, areaPropia, actor);
            programa(anio - 1, estado, areaPropia, actor);
            programa(anio, estado, areaAjena, actor);
            programa(anio, estado, areaOtroDepartamento, actorOtroDepartamento);
        }
        em.flush();
        DashboardResumenDTO resumen = resumen(Rol.COORDINADOR_AREA);
        assertThat(resumen.programasTotales()).isEqualTo(8);
        assertThat(resumen.programasVigentes()).isEqualTo(1);
        assertThat(resumen.pendienteAdministracion()).isEqualTo(1);
        assertThat(resumen.pendienteDocente()).isEqualTo(1);
        assertThat(resumen.pendienteComisiones()).isEqualTo(1);
        assertThat(resumen.pendienteSecretaria()).isEqualTo(3);
        assertThat(resumen.pendienteSecretariaInicial()).isEqualTo(2);
        assertThat(resumen.pendienteSecretariaFinal()).isEqualTo(1);
        assertThat(resumen.pendienteCoordinacionArea()).isEqualTo(1);
        assertThat(resumen.areas()).isZero();
    }

    @Test
    void resumenCccIncluyeOtrosDepartamentosSinIncluirCarrerasDeSuOtroVinculo() {
        ProgramaEntity compartido = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaOtroDepartamento, actorOtroDepartamento);
        decision(compartido, actor, 2, ResultadoDecisionComision.APROBADA);
        decision(compartido, actor, 2, ResultadoDecisionComision.APROBADA);
        decision(compartido, otroActor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity propio = programa(anio, EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA, areaPropia, actor);
        decision(propio, actor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity ajeno = programa(anio, EstadoPrograma.APROBADO, areaPropia, actor);
        decision(ajeno, actorOtroDepartamento, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity anterior = programa(anio - 1, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        decision(anterior, actor, 2, ResultadoDecisionComision.PENDIENTE);
        em.flush();
        DashboardResumenDTO resumen = resumen(Rol.COORDINACION_COMISION_CURRICULAR);
        assertThat(resumen.programasTotales()).isEqualTo(2);
        assertThat(resumen.pendienteComisiones()).isEqualTo(1);
        assertThat(resumen.programasVigentes()).isZero();
        assertThat(resumen.pendienteCoordinacionArea()).isEqualTo(1);
        assertThat(servicio.getListPendientesCoordinador(auth, departamento.getId(), Rol.COORDINACION_COMISION_CURRICULAR, pagina)).isEmpty();
    }

    @ParameterizedTest
    @EnumSource(value = Rol.class, names = {"ADMINISTRACION", "SECRETARIA", "DIRECCION_ADMINISTRATIVA", "SYSTEM_ADMIN", "DOCENTE"})
    void resumenConservaElAlcanceDepartamentalOResponsableSegunRol(Rol rol) {
        programa(anio, EstadoPrograma.RECHAZADO_A_DOCENTE, areaPropia, actor);
        programa(anio, EstadoPrograma.APROBADO, areaPropia, otroActor);
        programa(anio - 1, EstadoPrograma.RECHAZADO_A_DOCENTE, areaPropia, actor);
        programa(anio, EstadoPrograma.RECHAZADO_A_DOCENTE, areaOtroDepartamento, actorOtroDepartamento);
        em.flush();
        DashboardResumenDTO resultado = resumen(rol);
        assertThat(resultado.programasTotales()).isEqualTo(rol == Rol.DOCENTE ? 1 : 2);
        assertThat(resultado.programasVigentes()).isEqualTo(rol == Rol.DOCENTE ? 0 : 1);
        assertThat(resultado.pendienteDocente()).isEqualTo(1);
        if (rol == Rol.DOCENTE) assertThat(resultado.rechazadoDocente()).isEqualTo(1);
    }

    @Test
    void unUsuarioConVariosRolesSigueNecesitandoElRolSolicitado() {
        actor.getRoles().remove(Rol.COORDINADOR_AREA); em.flush();
        assertThatThrownBy(() -> pendientes(Rol.COORDINADOR_AREA)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> resumen(Rol.COORDINADOR_AREA)).isInstanceOf(AccessDeniedException.class);
    }

    @ParameterizedTest
    @EnumSource(Rol.class)
    void todosLosResumenesIncluyenLaEtapaDeAreaDentroDeSuAlcance(Rol rol) {
        ProgramaEntity propio = programa(anio, EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA, areaPropia, actor);
        decision(propio, actor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity anterior = programa(anio - 1, EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA, areaPropia, actor);
        decision(anterior, actor, 2, ResultadoDecisionComision.PENDIENTE);
        programa(anio, EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA, areaOtroDepartamento, actorOtroDepartamento);
        em.flush();
        assertThat(resumen(rol).pendienteCoordinacionArea()).isEqualTo(1);
    }

    @ParameterizedTest
    @EnumSource(Rol.class)
    void separaSecretariaInicialYFinalSinDuplicarLaSumaNiAmpliarElAlcance(Rol rol) {
        for (EstadoPrograma estado : List.of(EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL, EstadoPrograma.RECHAZADO_A_SECRETARIA,
                EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL)) {
            ProgramaEntity propio = programa(anio, estado, areaPropia, actor);
            decision(propio, actor, 2, ResultadoDecisionComision.PENDIENTE);
            ProgramaEntity anterior = programa(anio - 1, estado, areaPropia, actor);
            decision(anterior, actor, 2, ResultadoDecisionComision.PENDIENTE);
            ProgramaEntity futuro = programa(anio + 1, estado, areaPropia, actor);
            decision(futuro, actor, 2, ResultadoDecisionComision.PENDIENTE);
            programa(anio, estado, areaOtroDepartamento, actorOtroDepartamento);
        }
        em.flush();
        DashboardResumenDTO resultado = resumen(rol);
        assertThat(resultado.pendienteSecretariaInicial()).isEqualTo(2);
        assertThat(resultado.pendienteSecretariaFinal()).isEqualTo(1);
        assertThat(resultado.pendienteSecretaria()).isEqualTo(3)
                .isEqualTo(resultado.pendienteSecretariaInicial() + resultado.pendienteSecretariaFinal());
        if (rol == Rol.SECRETARIA) assertThat(pendientes(rol).getTotalElements()).isEqualTo(3);
    }

    @Test
    void conservaContadoresDeRecursosDepartamentalesYCamposNoAplicables() {
        when(areas.countByDepartamentoId(departamento.getId())).thenReturn(3L);
        when(carreras.countByDepartamentoId(departamento.getId())).thenReturn(4L);
        when(materias.countByDepartamentoId(departamento.getId())).thenReturn(5L);
        when(usuarios.countByDepartamentoId(departamento.getId())).thenReturn(6L);
        when(usuarios.countByDepartamentoIdAndRolesContaining(departamento.getId(), Rol.DOCENTE)).thenReturn(2L);
        when(usuarios.countByDepartamentoIdAndRolesContaining(departamento.getId(), Rol.ADMINISTRACION)).thenReturn(1L);
        for (Rol rol : List.of(Rol.ADMINISTRACION, Rol.SECRETARIA, Rol.DIRECCION_ADMINISTRATIVA, Rol.SYSTEM_ADMIN)) {
            DashboardResumenDTO resultado = resumen(rol);
            assertThat(List.of(resultado.areas(), resultado.carreras(), resultado.materias(), resultado.usuarios(), resultado.docentes(), resultado.administrativos()))
                    .containsExactly(3L, 4L, 5L, 6L, 2L, 1L);
            assertThat(resultado.rechazadoDocente()).isNull();
        }
        assertThat(resumen(Rol.DOCENTE).areas()).isNull();
        assertThat(resumen(Rol.COORDINACION_COMISION_CURRICULAR).areas()).isNull();
        assertThat(resumen(Rol.COORDINADOR_AREA).areas()).isZero();
    }

    @Test
    void consultaDirectaTambienDeniegaVinculosInactivosUsuariosDeshabilitadosYContextosInvalidos() {
        actor.setActivo(false); em.flush();
        assertThatThrownBy(() -> pendientes(Rol.COORDINADOR_AREA)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> resumen(Rol.COORDINADOR_AREA)).isInstanceOf(AccessDeniedException.class);
        actor.setActivo(true); actor.getUsuario().setEnabled(false); em.flush();
        assertThatThrownBy(() -> pendientes(Rol.DOCENTE)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> resumen(Rol.DOCENTE)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> servicio.getListPendientesCoordinador(auth, departamento.getId(), Rol.COORDINACION_COMISION_CURRICULAR, pagina))
                .isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> servicio.getDashboardResumen(null, departamento.getId(), Rol.ADMINISTRACION)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> servicio.getDashboardResumen(auth, departamento.getId(), null)).isInstanceOf(AccessDeniedException.class);
        actor.getUsuario().setEnabled(true); em.flush();
        Authentication ajeno = new UsernamePasswordAuthenticationToken("sin-vinculo", null);
        assertThatThrownBy(() -> servicio.getListPendientes(ajeno, departamento.getId(), Rol.ADMINISTRACION, pagina)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> servicio.getListPendientesCoordinador(auth, departamento.getId(), Rol.DOCENTE, pagina)).isInstanceOf(AccessDeniedException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"  aLgOrItMoS  ", "ALG2026", "Ana", "Pérez", "DOC123", "Computación"})
    void listadoCccBuscaPorMateriaCodigoDocenteYDepartamento(String search) {
        otroDepartamento.setNombre("Computación");
        UserEntity docente = usuario("DOC123"); docente.setNombre("Ana"); docente.setApellido("Pérez");
        UsuarioDepartamentoEntity responsable = vinculo(docente, otroDepartamento);
        ProgramaEntity esperado = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaOtroDepartamento, responsable);
        esperado.getMateria().setNombre("Algoritmos avanzados"); esperado.getMateria().setCodigo("ALG2026");
        decision(esperado, actor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity ajeno = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        decision(ajeno, actor, 2, ResultadoDecisionComision.PENDIENTE);
        em.flush();
        Page<ProgramaResponseDTO> resultado = buscarCcc(search, null, null, pagina);
        assertThat(resultado.getContent()).extracting(ProgramaResponseDTO::getId).containsExactly(esperado.getId());
        assertThat(resultado.getTotalElements()).isEqualTo(1);
    }

    @Test
    void busquedaCccFiltraAntesDePaginarConTotalesCorrectosYConservaAsignacionYAnio() {
        for (int i = 0; i < 11; i++) {
            ProgramaEntity sinCoincidencia = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
            decision(sinCoincidencia, actor, 2, ResultadoDecisionComision.PENDIENTE);
        }
        ProgramaEntity primero = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        primero.getMateria().setNombre("Redes iniciales"); decision(primero, actor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity segundo = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaOtroDepartamento, actorOtroDepartamento);
        segundo.getMateria().setNombre("Redes avanzadas"); decision(segundo, actor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity ajeno = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        ajeno.getMateria().setNombre("Redes ajenas"); decision(ajeno, otroActor, 2, ResultadoDecisionComision.PENDIENTE);
        for (int otroAnio : List.of(anio - 1, anio + 1)) {
            ProgramaEntity fueraDeAnio = programa(otroAnio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
            fueraDeAnio.getMateria().setNombre("Redes fuera del año actual"); decision(fueraDeAnio, actor, 2, ResultadoDecisionComision.PENDIENTE);
        }
        em.flush();
        Page<ProgramaResponseDTO> primera = buscarCcc("redes", null, null, PageRequest.of(0, 1, pagina.getSort()));
        Page<ProgramaResponseDTO> segunda = buscarCcc("redes", null, null, PageRequest.of(1, 1, pagina.getSort()));
        assertThat(primera.getTotalElements()).isEqualTo(2);
        assertThat(primera.getTotalPages()).isEqualTo(2);
        assertThat(primera.getContent()).extracting(ProgramaResponseDTO::getId).containsExactly(primero.getId());
        assertThat(segunda.getContent()).extracting(ProgramaResponseDTO::getId).containsExactly(segundo.getId());
        assertThat(buscarCcc("sin coincidencias", null, null, pagina).getTotalElements()).isZero();
    }

    @Test
    void busquedaCccSeCombinaConCarreraYEstado() {
        ProgramaEntity esperado = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        esperado.getMateria().setNombre("Redes"); decision(esperado, actor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaCarreraEntity bloque = em.createQuery("select b from ProgramaCarreraEntity b where b.programa = :programa", ProgramaCarreraEntity.class)
                .setParameter("programa", esperado).getSingleResult();
        ProgramaEntity otroEstado = programa(anio, EstadoPrograma.RECHAZADO_A_DOCENTE, areaPropia, actor);
        otroEstado.getMateria().setNombre("Redes");
        ProgramaCarreraEntity compartido = new ProgramaCarreraEntity(); compartido.setPrograma(otroEstado);
        compartido.setCarreraPlan(bloque.getCarreraPlan()); em.persist(compartido);
        ProgramaEntity otraCarrera = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        otraCarrera.getMateria().setNombre("Redes"); decision(otraCarrera, actor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity otroNombre = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        ProgramaCarreraEntity sinCoincidencia = new ProgramaCarreraEntity(); sinCoincidencia.setPrograma(otroNombre);
        sinCoincidencia.setCarreraPlan(bloque.getCarreraPlan()); em.persist(sinCoincidencia);
        em.flush();
        Page<ProgramaResponseDTO> resultado = buscarCcc("REDES", bloque.getCarreraPlan().getCarrera().getNombre(), EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, pagina);
        assertThat(resultado.getTotalElements()).isEqualTo(1);
        assertThat(resultado.getContent()).extracting(ProgramaResponseDTO::getId).containsExactly(esperado.getId());
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void busquedaCccVaciaMantieneElListadoAsignado(String search) {
        ProgramaEntity primero = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        decision(primero, actor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity segundo = programa(anio, EstadoPrograma.RECHAZADO_A_DOCENTE, areaPropia, actor);
        decision(segundo, actor, 2, ResultadoDecisionComision.PENDIENTE);
        ProgramaEntity ajeno = programa(anio, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, areaPropia, actor);
        decision(ajeno, otroActor, 2, ResultadoDecisionComision.PENDIENTE);
        em.flush();
        assertThat(buscarCcc(search, null, null, pagina).getContent()).extracting(ProgramaResponseDTO::getId)
                .containsExactly(primero.getId(), segundo.getId());
    }

    private Page<ProgramaResponseDTO> buscarCcc(String search, String carrera, EstadoPrograma estado, Pageable pageable) {
        return servicio.getListAnioActualCoordinador(auth, departamento.getId(), Rol.COORDINACION_COMISION_CURRICULAR,
                estado, carrera, search, pageable);
    }

    @AfterEach
    void noHayAccionesExternas() { verifyNoInteractions(correo, workflow); }

    private Page<ProgramaResponseReducedDTO> pendientes(Rol rol) { return servicio.getListPendientes(auth, departamento.getId(), rol, pagina); }
    private DashboardResumenDTO resumen(Rol rol) { return servicio.getDashboardResumen(auth, departamento.getId(), rol); }
    private DepartamentoEntity departamento(String nombre) {
        DepartamentoEntity d = new DepartamentoEntity(); d.setNombre(nombre); d.setDireccion("Sintética"); d.setTelefono("000");
        d.setEmail(nombre + "@example.invalid"); em.persist(d); return d;
    }
    private UserEntity usuario(String legajo) {
        UserEntity u = new UserEntity(); u.setNombre("Persona"); u.setApellido("Sintética"); u.setLegajo(legajo); u.setEnabled(true); em.persist(u); return u;
    }
    private UsuarioDepartamentoEntity vinculo(UserEntity u, DepartamentoEntity d) {
        UsuarioDepartamentoEntity v = new UsuarioDepartamentoEntity(); v.setUsuario(u); v.setDepartamento(d); v.setEmail(u.getLegajo() + d.getNombre() + "@example.invalid");
        v.getRoles().addAll(EnumSet.allOf(Rol.class)); em.persist(v); return v;
    }
    private AreaEntity area(String nombre, UsuarioDepartamentoEntity coordinador) {
        AreaEntity a = new AreaEntity(); a.setNombre(nombre); a.setDepartamento(coordinador.getDepartamento()); a.setCoordinador(coordinador); em.persist(a); return a;
    }
    private ProgramaEntity programa(int anio, EstadoPrograma estado, AreaEntity area, UsuarioDepartamentoEntity docente) {
        MateriaEntity m = new MateriaEntity(); m.setNombre("Materia " + ++secuencia); m.setCodigo("M" + secuencia);
        m.setArea(area); m.setDepartamento(area.getDepartamento()); em.persist(m);
        ProgramaEntity p = new ProgramaEntity(); p.setAnio(anio); p.setMateria(m); p.setEstadoActual(estado);
        p.setDocenteResponsable(docente); p.setRondaRevision(2); em.persist(p); return p;
    }
    private void decision(ProgramaEntity programa, UsuarioDepartamentoEntity comision, int ronda, ResultadoDecisionComision resultado) {
        CarreraEntity c = new CarreraEntity(); c.setNombre("Carrera " + ++secuencia); c.setDuracion("5 años");
        c.setDepartamento(comision.getDepartamento()); c.setComision(comision); em.persist(c);
        CarreraPlanEntity plan = new CarreraPlanEntity(); plan.setCarrera(c); plan.setAnio(String.valueOf(anio)); plan.setVersion(1); em.persist(plan);
        ProgramaCarreraEntity bloque = new ProgramaCarreraEntity(); bloque.setPrograma(programa); bloque.setCarreraPlan(plan); em.persist(bloque);
        DecisionComisionEntity decision = new DecisionComisionEntity(); decision.setPrograma(programa); decision.setProgramaCarrera(bloque);
        decision.setCarreraPlanId(plan.getId()); decision.setRonda(ronda); decision.setResultado(resultado); em.persist(decision);
    }
}

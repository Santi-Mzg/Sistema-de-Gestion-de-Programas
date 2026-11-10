package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.utils.ProgramaSpecifications;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.ContextoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.ConflictoProgramaException;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ContextConfiguration;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@DataJpaTest(showSql = false)
@org.springframework.test.context.TestPropertySource(locations = "classpath:application-ci.properties")
@ContextConfiguration(classes = ProgramaCircuitoIntegrationTest.Config.class)
@Import({ProgramaWorkflowService.class, ContextoPrograma.class, ProgramaBorradorService.class})
class ProgramaCircuitoIntegrationTest {
    @Configuration
    @EnableAutoConfiguration
    @EntityScan(basePackageClasses = ProgramaEntity.class)
    @EnableJpaRepositories(basePackageClasses = ProgramaRepository.class)
    static class Config {}

    @Autowired EntityManager em;
    @Autowired ProgramaWorkflowService circuito;
    @Autowired ProgramaDraftRepository drafts;
    @Autowired ProgramaRepository programas;
    @Autowired DecisionComisionRepository decisiones;
    @MockBean EmailService correo;
    UsuarioDepartamentoEntity vinculo;
    MateriaEntity materia;
    CarreraPlanEntity plan;
    DepartamentoEntity departamento;

    @BeforeEach void preparar() {
        departamento = new DepartamentoEntity(); departamento.setNombre("Departamento sintético"); departamento.setDireccion("Dirección sintética"); departamento.setTelefono("000"); departamento.setEmail("departamento@example.invalid"); em.persist(departamento);
        UserEntity usuario = new UserEntity(); usuario.setNombre("Usuario"); usuario.setApellido("Sintético"); usuario.setLegajo("100"); usuario.setEnabled(true); em.persist(usuario);
        vinculo = new UsuarioDepartamentoEntity(); vinculo.setUsuario(usuario); vinculo.setDepartamento(departamento); vinculo.setEmail("usuario@example.invalid");
        vinculo.getRoles().addAll(EnumSet.allOf(Rol.class)); em.persist(vinculo); departamento.getUsuarios().add(vinculo);
        AreaEntity area = new AreaEntity(); area.setNombre("Área sintética"); area.setDepartamento(departamento); em.persist(area);
        materia = new MateriaEntity(); materia.setCodigo("PRUEBA"); materia.setNombre("Materia sintética"); materia.setArea(area); materia.setDepartamento(departamento); em.persist(materia);
        CarreraEntity carrera = new CarreraEntity(); carrera.setNombre("Carrera sintética"); carrera.setDuracion("5"); carrera.setDepartamento(departamento); carrera.setComision(vinculo); em.persist(carrera);
        plan = new CarreraPlanEntity(); plan.setCarrera(carrera); plan.setAnio("2026"); plan.setVersion(1); em.persist(plan); em.flush();
    }

    ProgramaEntity crearHastaDocente() {
        ProgramaCargaDTO datos = new ProgramaCargaDTO(); datos.setMateriaId(materia.getId()); datos.setDocenteResponsableId(vinculo.getUsuario().getId());
        datos.setCantidadSemanas(16); datos.setCargaHorariaSemanal(4); datos.setCreditos(6);
        ProgramaEntity p = circuito.crear(departamento.getId(), datos, vinculo.getUsuario());
        assertThat(p.getEstadoActual()).isEqualTo(EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL);
        datos.setBloqueMultiple(List.of(datosBloque(plan))); datos.setContenidosMinimos("Contenidos sintéticos");
        circuito.cargar(departamento.getId(), p.getId(), datos, vinculo.getUsuario(), Rol.SECRETARIA);
        assertThat(p.getEstadoActual()).isEqualTo(EstadoPrograma.PENDIENTE_DE_DOCENTE);
        return p;
    }

    ProgramaCarreraCreateDTO datosBloque(CarreraPlanEntity carreraPlan) {
        ProgramaCarreraCreateDTO bloque = new ProgramaCarreraCreateDTO(); bloque.setCarreraPlanId(carreraPlan.getId()); bloque.setUbicacionEnPlan("Primer año");
        bloque.setCorrelativasFuertesIds(List.of()); bloque.setCorrelativasDebilesIds(List.of());
        return bloque;
    }

    CarreraPlanEntity agregarPlan(ProgramaEntity p, int version) {
        CarreraPlanEntity otro = new CarreraPlanEntity(); otro.setCarrera(plan.getCarrera()); otro.setAnio("2026"); otro.setVersion(version); em.persist(otro);
        ProgramaCarreraEntity bloque = new ProgramaCarreraEntity(); bloque.setPrograma(p); bloque.setCarreraPlan(otro); bloque.setUbicacionEnPlan("Segundo año");
        p.getBloqueMultiple().add(bloque); em.persist(bloque);
        return otro;
    }

    void enviarDocente(ProgramaEntity p) {
        ProgramaCargaDTO d = new ProgramaCargaDTO(); d.setCargaHorariaPractica(2); d.setFundamentacion("F"); d.setObjetivos("O"); d.setProgramaAnalitico("P"); d.setMetodologia("M"); d.setModalidadEvaluacion("E"); d.setBibliografia("B");
        circuito.cargar(departamento.getId(), p.getId(), d, vinculo.getUsuario(), Rol.DOCENTE);
    }

    EstadoUpdateDTO decision(AccionPrograma accion) { EstadoUpdateDTO d = new EstadoUpdateDTO(); d.setAccion(accion); return d; }

    EstadoUpdateDTO rechazo(Rol destino) {
        EstadoUpdateDTO d = decision(AccionPrograma.RECHAZAR); d.setDestinoRechazo(destino); d.setJustificacion("Corregir objetivos"); return d;
    }

    @Test void circuitoCompletoSinAreaConservaContenidoYDecisionIndividual() {
        ProgramaEntity p = crearHastaDocente(); enviarDocente(p);
        assertThat(p.getEstadoActual()).isEqualTo(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES);
        verify(correo).sendEmailNotificacionCargaSecretariaInicial(departamento.getSecretaria(), p);
        verify(correo).sendEmailNotificacionCargaAdministrativo(vinculo.getEmail(), vinculo.getUsuario(), materia);
        verify(correo).sendEmailNotificacionCargaDocente(vinculo.getEmail(), p, plan.getCarrera());
        EstadoUpdateDTO aceptar = decision(AccionPrograma.APROBAR); aceptar.setContribucionCarrera("Contribución de esta carrera");
        circuito.decidir("100", departamento.getId(), p.getId(), plan.getId(), Rol.COORDINACION_COMISION_CURRICULAR, aceptar);
        assertThat(p.getEstadoActual()).isEqualTo(EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL);
        verify(correo).sendEmailNotificacionAprobacionComision(vinculo.getEmail(), vinculo.getUsuario(), materia);
        circuito.decidir("100", departamento.getId(), p.getId(), null, Rol.SECRETARIA, decision(AccionPrograma.APROBAR));
        em.flush(); em.clear();
        ProgramaEntity guardado = em.find(ProgramaEntity.class, p.getId());
        assertThat(guardado.getEstadoActual()).isEqualTo(EstadoPrograma.APROBADO);
        assertThat(guardado.getBloqueMultiple().get(0).getContribucion()).isEqualTo("Contribución de esta carrera");
        assertThat(guardado.getDecisionesComision()).singleElement().satisfies(d -> {
            assertThat(d.getResultado()).isEqualTo(ResultadoDecisionComision.APROBADA);
            assertThat(d.getCarreraPlanId()).isEqualTo(plan.getId());
            assertThat(d.getActor().getId()).isEqualTo(vinculo.getId());
            assertThat(d.getFechaDecision()).isNotNull();
        });
        assertThat(guardado.getHistorialEstados()).extracting(EstadoHistoricoEntity::getEstado)
                .containsExactly(EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL, EstadoPrograma.PENDIENTE_DE_DOCENTE,
                        EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL, EstadoPrograma.APROBADO);
        assertThat(guardado.getHistorialEstados().get(2).getObservacion()).contains("no tiene coordinador");
    }

    @Test void conCoordinadorExigeValidacionDeArea() {
        materia.getArea().setCoordinador(vinculo);
        ProgramaEntity p = crearHastaDocente(); enviarDocente(p);
        assertThat(p.getEstadoActual()).isEqualTo(EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA);
        verify(correo).sendEmailNotificacionRevisionArea(vinculo, p);
        verify(correo, never()).sendEmailNotificacionCargaDocente(any(), any(), any());
        circuito.decidir("100", departamento.getId(), p.getId(), null, Rol.COORDINADOR_AREA, decision(AccionPrograma.APROBAR));
        assertThat(p.getEstadoActual()).isEqualTo(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES);
        assertThat(p.getHistorialEstados()).anySatisfy(h -> {
            assertThat(h.getActorRol()).isEqualTo(Rol.COORDINADOR_AREA);
            assertThat(h.getObservacion()).contains("Área sintética", "aceptó");
            assertThat(h.getJustificacion()).isNull();
        });
    }

    @Test void destinoNoPermitidoSigueSiendoUnErrorDePermisosYSinEscrituras() {
        ProgramaEntity p = crearHastaDocente(); int estadosAnteriores = p.getHistorialEstados().size();
        clearInvocations(correo);
        assertThatThrownBy(() -> circuito.decidir("100", departamento.getId(), p.getId(), null, Rol.DOCENTE, rechazo(Rol.COORDINADOR_AREA)))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
        assertThat(p.getEstadoActual()).isEqualTo(EstadoPrograma.PENDIENTE_DE_DOCENTE);
        assertThat(p.getHistorialEstados()).hasSize(estadosAnteriores); verifyNoInteractions(correo);
    }

    @Test void rechazoPuedeGuardarContribucionYReenvioExigeDecisionNueva() {
        ProgramaEntity p = crearHastaDocente(); enviarDocente(p);
        EstadoUpdateDTO rechazar = rechazo(Rol.DOCENTE); rechazar.setGuardarCambios(true); rechazar.setContribucionCarrera("Trabajo que se conserva");
        circuito.decidir("100", departamento.getId(), p.getId(), plan.getId(), Rol.COORDINACION_COMISION_CURRICULAR, rechazar);
        assertThat(p.getEstadoActual()).isEqualTo(EstadoPrograma.RECHAZADO_A_DOCENTE);
        verify(correo).sendEmailNotificacionRechazoComision(vinculo.getEmail(), vinculo.getUsuario(), vinculo.getUsuario(), materia, plan.getCarrera(), "Corregir objetivos");
        verify(correo, never()).sendEmailNotificacionRechazo(any(), any(), any(), any(), any(), any());
        assertThat(p.getBloqueMultiple().get(0).getContribucion()).isEqualTo("Trabajo que se conserva");
        enviarDocente(p); em.flush();
        assertThat(p.getRondaRevision()).isEqualTo(2);
        assertThat(p.getBloqueMultiple().get(0).getDecisionComision().getResultado()).isEqualTo(ResultadoDecisionComision.PENDIENTE);
        assertThat(p.getBloqueMultiple().get(0).getContribucion()).isEqualTo("Trabajo que se conserva");
    }

    @Test void cadaPlanRequiereDecisionYUnRechazoConservaLasContribucionesPrevias() {
        ProgramaEntity p = crearHastaDocente(); CarreraPlanEntity segundo = agregarPlan(p, 2); agregarPlan(p, 3); enviarDocente(p);
        int estadosAntes = p.getHistorialEstados().size();
        EstadoUpdateDTO aceptar = decision(AccionPrograma.APROBAR); aceptar.setContribucionCarrera("Contribución del primer plan");
        circuito.decidir("100", departamento.getId(), p.getId(), plan.getId(), Rol.COORDINACION_COMISION_CURRICULAR, aceptar);
        assertThat(p.getEstadoActual()).isEqualTo(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES);
        assertThat(p.getHistorialEstados()).hasSize(estadosAntes);
        Long programaId = p.getId();
        assertThatThrownBy(() -> circuito.decidir("100", departamento.getId(), programaId, plan.getId(),
                Rol.COORDINACION_COMISION_CURRICULAR, aceptar)).isInstanceOf(ConflictoProgramaException.class);
        circuito.decidir("100", departamento.getId(), p.getId(), segundo.getId(), Rol.COORDINACION_COMISION_CURRICULAR, rechazo(Rol.DOCENTE));
        em.flush(); em.clear(); p = em.find(ProgramaEntity.class, p.getId());
        assertThat(p.getDecisionesComision()).extracting(DecisionComisionEntity::getResultado)
                .containsExactly(ResultadoDecisionComision.APROBADA, ResultadoDecisionComision.RECHAZADA, ResultadoDecisionComision.CANCELADA);
        assertThat(p.getDecisionesComision().get(1)).satisfies(d -> {
            assertThat(d.getJustificacion()).isEqualTo("Corregir objetivos");
            assertThat(d.getDestinoRechazo()).isEqualTo(Rol.DOCENTE);
            assertThat(d.getActor().getId()).isEqualTo(vinculo.getId());
        });
        assertThat(p.getDecisionesComision().get(2).getActor()).isNull();
        assertThat(programas.count(ProgramaSpecifications.pendienteComision(vinculo.getId()))).isZero();
        enviarDocente(p); em.flush(); em.clear(); p = em.find(ProgramaEntity.class, p.getId());
        assertThat(p.getDecisionesComision()).hasSize(6);
        assertThat(p.getBloqueMultiple()).allSatisfy(pc -> assertThat(pc.getDecisionComision().getResultado()).isEqualTo(ResultadoDecisionComision.PENDIENTE));
        assertThat(p.getBloqueMultiple().get(0).getContribucion()).isEqualTo("Contribución del primer plan");
        assertThat(decisiones.countPendientesRondaActual(p.getId())).isEqualTo(3);
        assertThat(programas.count(ProgramaSpecifications.pendienteComision(vinculo.getId()))).isEqualTo(1);
        assertThat(p.getHistorialEstados()).extracting(EstadoHistoricoEntity::getEstado)
                .containsExactly(EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL, EstadoPrograma.PENDIENTE_DE_DOCENTE,
                        EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, EstadoPrograma.RECHAZADO_A_DOCENTE, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES);
    }

    @Test void quitarUnBloqueNoBorraSusDecisionesHistoricas() {
        ProgramaEntity p = crearHastaDocente(); enviarDocente(p);
        circuito.decidir("100", departamento.getId(), p.getId(), plan.getId(), Rol.COORDINACION_COMISION_CURRICULAR, rechazo(Rol.SECRETARIA));
        CarreraPlanEntity nuevo = new CarreraPlanEntity(); nuevo.setCarrera(plan.getCarrera()); nuevo.setAnio("2027"); nuevo.setVersion(1); em.persist(nuevo);
        ProgramaCargaDTO correccion = new ProgramaCargaDTO(); correccion.setBloqueMultiple(List.of(datosBloque(nuevo)));
        circuito.cargar(departamento.getId(), p.getId(), correccion, vinculo.getUsuario(), Rol.SECRETARIA);
        em.flush(); em.clear(); p = em.find(ProgramaEntity.class, p.getId());
        assertThat(p.getBloqueMultiple()).singleElement().satisfies(b -> assertThat(b.getCarreraPlan().getId()).isEqualTo(nuevo.getId()));
        assertThat(p.getDecisionesComision()).singleElement().satisfies(d -> {
            assertThat(d.getProgramaCarrera()).isNull(); assertThat(d.getCarreraPlanId()).isEqualTo(plan.getId());
            assertThat(d.getCarreraNombre()).isEqualTo("Carrera sintética");
            assertThat(d.getPlanAnio()).isEqualTo("2026"); assertThat(d.getResultado()).isEqualTo(ResultadoDecisionComision.RECHAZADA);
        });
    }

    @Test void enviarEliminaSoloElDraftDelActorRolProgramaMateriaYAnio() {
        ProgramaEntity p = crearHastaDocente();
        for (int i = 0; i < 4; i++) {
            ProgramaDraftEntity draft = new ProgramaDraftEntity(); draft.setUsuarioId(i == 1 ? 999L : vinculo.getUsuario().getId());
            draft.setMateriaId(materia.getId()); draft.setAnio(i == 2 ? p.getAnio() - 1 : p.getAnio());
            draft.setRol(i == 3 ? Rol.ADMINISTRACION : Rol.DOCENTE); draft.setProgramaId(p.getId()); draft.setPlanId(0L);
            draft.setPayloadJson("{}"); draft.setLastUpdated(java.time.LocalDateTime.now()); drafts.save(draft);
        }
        drafts.flush(); enviarDocente(p); em.flush(); assertThat(drafts.count()).isEqualTo(3);
        assertThat(drafts.findByUsuarioIdAndMateriaIdAndAnioAndRolAndProgramaIdAndPlanId(vinculo.getUsuario().getId(), materia.getId(), p.getAnio(), Rol.DOCENTE, p.getId(), 0L)).isEmpty();
    }

    @Test void eliminarProgramaBorraDecisionesPeroNoSusDrafts() {
        ProgramaEntity p = crearHastaDocente(); enviarDocente(p);
        ProgramaDraftEntity draft = new ProgramaDraftEntity();
        draft.setUsuarioId(vinculo.getUsuario().getId()); draft.setMateriaId(materia.getId()); draft.setAnio(p.getAnio());
        draft.setRol(Rol.DOCENTE); draft.setProgramaId(p.getId()); draft.setPlanId(0L);
        draft.setPayloadJson("{}"); draft.setLastUpdated(java.time.LocalDateTime.now()); drafts.saveAndFlush(draft);
        programas.delete(p); em.flush(); em.clear();
        assertThat(programas.findById(p.getId())).isEmpty();
        assertThat(decisiones.count()).isZero();
        assertThat(drafts.findById(draft.getId())).isPresent();
    }

    @Test void desasignarAreaAvanzaPendientesSinInventarUnaAceptacion() {
        materia.getArea().setCoordinador(vinculo); ProgramaEntity p = crearHastaDocente(); enviarDocente(p);
        materia.getArea().setCoordinador(null); circuito.omitirArea(materia.getArea(), vinculo, Rol.SECRETARIA);
        assertThat(p.getEstadoActual()).isEqualTo(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES);
        assertThat(p.getHistorialEstados().get(p.getHistorialEstados().size() - 1)).satisfies(h -> {
            assertThat(h.getObservacion()).contains("desasignación", "Área sintética");
            assertThat(h.getActorRol()).isEqualTo(Rol.SECRETARIA); assertThat(h.getJustificacion()).isNull();
        });
        verify(correo).sendEmailNotificacionCargaDocente(vinculo.getEmail(), p, plan.getCarrera());
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.CsvSource({
            "COMPLETO_POR_PROFESOR,PENDIENTE_DE_COMISIONES_CURRICULARES",
            "COMPLETO_POR_DOCENTE,PENDIENTE_DE_COMISIONES_CURRICULARES",
            "COMPLETO_POR_ADMINISTRACION,PENDIENTE_DE_SECRETARIA_INICIAL",
            "COMPLETO_POR_SECRETARIA,PENDIENTE_DE_DOCENTE",
            "APROBADO_POR_COMISION,PENDIENTE_DE_SECRETARIA_FINAL",
            "APROBADO_POR_SECRETARIA,APROBADO",
            "RECHAZADO_A_PROFESOR,RECHAZADO_A_DOCENTE"
    })
    void consultaEstadosHistoricosConLaTerminologiaActualSinMigrarlos(String anterior, EstadoPrograma actual) {
        ProgramaEntity p = crearHastaDocente();
        em.createNativeQuery("update programas set estado_actual = :estado where id = :id")
                .setParameter("estado", anterior).setParameter("id", p.getId()).executeUpdate();
        em.clear(); assertThat(em.find(ProgramaEntity.class, p.getId()).getEstadoActual()).isEqualTo(actual);
        assertThat(programas.findAll(ProgramaSpecifications.estado(actual)))
                .extracting(ProgramaEntity::getId).containsExactly(p.getId());
        assertThat(programas.count(ProgramaSpecifications.estadoIn(List.of(actual)))).isEqualTo(1);
    }

    @Test void duplicadoNoEliminaProgramaAnterior() {
        ProgramaEntity p = crearHastaDocente();
        ProgramaCargaDTO d = new ProgramaCargaDTO(); d.setMateriaId(materia.getId()); d.setDocenteResponsableId(vinculo.getUsuario().getId());
        assertThatThrownBy(() -> circuito.crear(departamento.getId(), d, vinculo.getUsuario())).isInstanceOf(ConflictoProgramaException.class);
        assertThat(em.find(ProgramaEntity.class, p.getId())).isNotNull();
    }
}

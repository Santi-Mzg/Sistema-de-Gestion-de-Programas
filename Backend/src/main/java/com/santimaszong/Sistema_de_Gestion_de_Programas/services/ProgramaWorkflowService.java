package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.utils.CircuitoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.ContextoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.ConflictoProgramaException;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.ValidacionProgramaException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

/** Coordina escrituras del circuito; ninguna carga parcial avanza una etapa. */
@Service
@RequiredArgsConstructor
@Transactional
public class ProgramaWorkflowService {
    private final ProgramaRepository programas;
    private final ProgramaDraftRepository drafts;
    private final MateriaRepository materias;
    private final CarreraPlanRepository planes;
    private final UsuarioDepartamentoRepository usuarios;
    private final DecisionComisionRepository decisiones;
    private final ContextoPrograma contexto;
    private final EmailService correo;

    public ProgramaEntity crear(Long deptId, ProgramaCargaDTO datos, UserEntity usuario) {
        UsuarioDepartamentoEntity actor = contexto.exigir(usuario.getLegajo(), deptId, Rol.ADMINISTRACION);
        ProgramaEntity programa = new ProgramaEntity();
        cargarAdministracion(programa, datos, actor, true);
        programa.setAnio(LocalDate.now().getYear());
        if (programas.existsByMateriaIdAndAnio(programa.getMateria().getId(), programa.getAnio()))
            throw new ConflictoProgramaException("Ya existe un programa para esta materia y año");
        validarAdministracion(programa);
        programa.registrarNuevoEstado(EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL, actor, Rol.ADMINISTRACION, null);
        programas.save(programa);
        limpiarDraft(programa, actor, Rol.ADMINISTRACION, 0L, 0L);
        correo.sendEmailNotificacionCargaSecretariaInicial(programa.getMateria().getDepartamento().getSecretaria(), programa);
        return programa;
    }

    public ProgramaEntity cargar(Long deptId, Long id, ProgramaCargaDTO datos, UserEntity usuario, Rol rol) {
        UsuarioDepartamentoEntity actor = contexto.exigir(usuario.getLegajo(), deptId, rol);
        ProgramaEntity programa = bloquear(id);
        Long materiaDelDraft = programa.getMateria().getId();
        contexto.consultar(programa, actor, rol);
        if (rol == Rol.ADMINISTRACION) {
            if (programa.getEstadoActual() != EstadoPrograma.RECHAZADO_A_ADMINISTRACION)
                throw new IllegalStateException("El programa no está pendiente de Administración");
            if (datos.getDocenteResponsableId() != null
                    && !datos.getDocenteResponsableId().equals(programa.getDocenteResponsable().getUsuario().getId())
                    && !programa.getAdministracionResponsable().getId().equals(actor.getId()))
                throw new AccessDeniedException("Solo el administrativo creador puede cambiar al docente responsable");
            cargarAdministracion(programa, datos, actor, false);
            validarAdministracion(programa);
            programa.registrarNuevoEstado(EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL, actor, rol, null);
            correo.sendEmailNotificacionCargaSecretariaInicial(programa.getMateria().getDepartamento().getSecretaria(), programa);
        } else if (rol == Rol.SECRETARIA) {
            if (!CircuitoPrograma.esSecretariaInicial(programa.getEstadoActual()))
                throw new IllegalStateException("El programa no está pendiente de Secretaría inicial");
            cargarSecretaria(programa, datos, actor);
            validarAdministracion(programa);
            exigirTexto(programa.getContenidosMinimos(), "Los contenidos mínimos son obligatorios");
            validarBloques(programa);
            programa.registrarNuevoEstado(EstadoPrograma.PENDIENTE_DE_DOCENTE, actor, rol, null);
            UsuarioDepartamentoEntity docente = programa.getDocenteResponsable();
            correo.sendEmailNotificacionCargaAdministrativo(
                    docente.getEmail(), docente.getUsuario(), programa.getMateria());
        } else if (rol == Rol.DOCENTE) {
            if (!CircuitoPrograma.esCargaDocente(programa.getEstadoActual()))
                throw new IllegalStateException("El programa no está pendiente del Docente");
            cargarDocente(programa, datos);
            validarDocente(programa);
            boolean tieneCoordinador = programa.getMateria().getArea().getCoordinador() != null;
            String observacion = tieneCoordinador ? null : "Revisión de Área omitida: el área "
                    + programa.getMateria().getArea().getNombre() + " no tiene coordinador. El programa pasa a las comisiones curriculares.";
            programa.registrarNuevoEstado(CircuitoPrograma.siguienteEnvioDocente(tieneCoordinador), actor, rol, null, observacion);
            if (tieneCoordinador) correo.sendEmailNotificacionRevisionArea(programa.getMateria().getArea().getCoordinador(), programa);
            else abrirComisiones(programa);
        } else throw new AccessDeniedException("Este rol no puede cargar el programa");
        limpiarDraft(programa, actor, rol, programa.getId(), 0L, materiaDelDraft);
        return programas.save(programa);
    }

    public ProgramaEntity decidir(String legajo, Long deptId, Long id, Long planId, Rol rol, EstadoUpdateDTO datos) {
        UsuarioDepartamentoEntity actor = contexto.exigir(legajo, deptId, rol);
        ProgramaEntity programa = bloquear(id);
        Long materiaDelDraft = programa.getMateria().getId();
        contexto.consultar(programa, actor, rol);
        CircuitoPrograma.validarRevision(programa.getEstadoActual(), rol);
        if (datos.getAccion() == null) throw new ValidacionProgramaException("Debe seleccionar una acción");
        ProgramaCarreraEntity bloque = rol == Rol.COORDINACION_COMISION_CURRICULAR
                ? bloquePendiente(programa, planId, actor) : null;
        if (datos.getAccion() == AccionPrograma.RECHAZAR) {
            exigirTexto(datos.getJustificacion(), "La justificación del rechazo es obligatoria");
            if (!CircuitoPrograma.puedeRechazarA(programa.getEstadoActual(), rol, datos.getDestinoRechazo())) {
                throw new AccessDeniedException("El destino de rechazo no está permitido para esta etapa");
            }
            EstadoPrograma destino = CircuitoPrograma.destinoRechazo(programa.getEstadoActual(), rol, datos.getDestinoRechazo());
            if (datos.isGuardarCambios()) {
                if (rol == Rol.SECRETARIA && CircuitoPrograma.esSecretariaInicial(programa.getEstadoActual())) {
                    if (datos.getCambios() == null) throw new ValidacionProgramaException("Faltan los cambios a guardar");
                    cargarSecretaria(programa, datos.getCambios(), actor);
                } else if (rol == Rol.DOCENTE) {
                    if (datos.getCambios() == null) throw new ValidacionProgramaException("Faltan los cambios a guardar");
                    cargarDocente(programa, datos.getCambios());
                } else if (bloque != null) bloque.setContribucion(datos.getContribucionCarrera());
                else throw new ValidacionProgramaException("Esta etapa no tiene campos editables");
            }
            if (bloque != null) {
                registrarDecision(bloque.getDecisionComision(), ResultadoDecisionComision.RECHAZADA, actor,
                        datos.getJustificacion().trim(), datos.getDestinoRechazo());
            }
            String observacion = rol == Rol.COORDINADOR_AREA
                    ? "Rechazo de Coordinación de Área: " + programa.getMateria().getArea().getNombre() : null;
            programa.registrarNuevoEstado(destino, actor, rol, datos.getJustificacion().trim(), observacion);
            cerrarDecisiones(programa);
            UsuarioDepartamentoEntity destinatario = switch (datos.getDestinoRechazo()) {
                case ADMINISTRACION -> programa.getAdministracionResponsable();
                case SECRETARIA -> programa.getMateria().getDepartamento().getSecretaria();
                case DOCENTE -> programa.getDocenteResponsable();
                default -> throw new ValidacionProgramaException("Destino inválido");
            };
            if (destinatario == null || !destinatario.isActivo()) throw new IllegalStateException("El destino no tiene responsable activo");
            if (bloque != null) {
                correo.sendEmailNotificacionRechazoComision(destinatario.getEmail(), destinatario.getUsuario(),
                        actor.getUsuario(), programa.getMateria(), bloque.getCarreraPlan().getCarrera(), datos.getJustificacion());
            } else {
                correo.sendEmailNotificacionRechazo(destinatario.getEmail(), destinatario.getUsuario(), rol,
                        actor.getUsuario(), programa.getMateria(), datos.getJustificacion());
            }
            if (rol == Rol.COORDINACION_COMISION_CURRICULAR) notificarRechazoComisiones(programa, actor, bloque, datos);
        } else if (rol == Rol.COORDINADOR_AREA) {
            programa.registrarNuevoEstado(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, actor, rol, null,
                    "Coordinación de Área " + programa.getMateria().getArea().getNombre()
                            + " aceptó el programa y lo envió a las comisiones curriculares.");
            abrirComisiones(programa);
        } else if (bloque != null) {
            bloque.setContribucion(datos.getContribucionCarrera());
            registrarDecision(bloque.getDecisionComision(), ResultadoDecisionComision.APROBADA, actor, null, null);
            if (programa.getBloqueMultiple().stream().allMatch(pc -> pc.getDecisionComision() != null && pc.getDecisionComision().isAprobado())) {
                programa.registrarNuevoEstado(EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL, actor, rol, null,
                        "Aceptación de todos los bloques por sus comisiones curriculares.");
                UsuarioDepartamentoEntity secretaria = programa.getMateria().getDepartamento().getSecretaria();
                correo.sendEmailNotificacionAprobacionComision(
                        secretaria.getEmail(), secretaria.getUsuario(), programa.getMateria());
            }
        } else if (rol == Rol.SECRETARIA && programa.getEstadoActual() == EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL) {
            programa.registrarNuevoEstado(EstadoPrograma.APROBADO, actor, rol, null);
        } else throw new AccessDeniedException("Esta etapa debe completarse mediante su formulario de carga");
        limpiarDraft(programa, actor, rol, programa.getId(), rol == Rol.COORDINACION_COMISION_CURRICULAR ? planId : 0L, materiaDelDraft);
        return programas.save(programa);
    }

    private void limpiarDraft(ProgramaEntity p, UsuarioDepartamentoEntity actor, Rol rol, Long programaId, Long planId) {
        limpiarDraft(p, actor, rol, programaId, planId, p.getMateria().getId());
    }

    private void limpiarDraft(ProgramaEntity p, UsuarioDepartamentoEntity actor, Rol rol, Long programaId, Long planId, Long materiaId) {
        drafts.deleteByUsuarioIdAndMateriaIdAndAnioAndRolAndProgramaIdAndPlanId(actor.getUsuario().getId(),
                materiaId, p.getAnio(), rol, programaId, planId);
    }

    public ProgramaEntity bloquear(Long id) {
        return programas.findForUpdateById(id).orElseThrow(() -> new EntityNotFoundException("Programa no existente"));
    }

    public void omitirArea(AreaEntity area, UsuarioDepartamentoEntity actor, Rol rol) {
        for (ProgramaEntity candidato : programas.findByMateriaAreaIdAndEstadoActual(area.getId(), EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA)) {
            ProgramaEntity programa = bloquear(candidato.getId());
            if (programa.getEstadoActual() != EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA) continue;
            omitirPrograma(programa, actor, rol, "Revisión de Área omitida por desasignación del coordinador del área "
                    + area.getNombre() + ". El programa pasa a las comisiones curriculares.");
        }
    }

    public void omitirPrograma(ProgramaEntity programa, UsuarioDepartamentoEntity actor, Rol rol) {
        omitirPrograma(programa, actor, rol, "Revisión de Área omitida: el área "
                + programa.getMateria().getArea().getNombre()
                + " no tiene coordinador. El programa pasa a las comisiones curriculares.");
    }

    private void omitirPrograma(ProgramaEntity programa, UsuarioDepartamentoEntity actor, Rol rol, String observacion) {
        if (programa.getEstadoActual() != EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA) return;
        programa.registrarNuevoEstado(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, actor, rol, null, observacion);
        abrirComisiones(programa);
    }

    private void cargarAdministracion(ProgramaEntity programa, ProgramaCargaDTO datos, UsuarioDepartamentoEntity actor, boolean nuevo) {
        if (datos == null) throw new ValidacionProgramaException("Faltan los datos del programa");
        if (datos.getMateriaId() != null) {
            MateriaEntity materia = materias.findById(datos.getMateriaId()).orElseThrow(() -> new EntityNotFoundException("Materia no existente"));
            if (!materia.getDepartamento().getId().equals(actor.getDepartamento().getId())) throw new AccessDeniedException("La materia no pertenece al departamento activo");
            if (materia.getArea() == null) throw new IllegalStateException("La materia debe tener un área asignada");
            if (!nuevo && !materia.getId().equals(programa.getMateria().getId())
                    && programas.existsByMateriaIdAndAnio(materia.getId(), programa.getAnio()))
                throw new ConflictoProgramaException("Ya existe un programa para esta materia y año");
            programa.setMateria(materia);
        }
        if (datos.getDocenteResponsableId() != null) {
            UsuarioDepartamentoEntity docente = usuarios.findByUsuarioIdAndDepartamentoId(datos.getDocenteResponsableId(), actor.getDepartamento().getId())
                    .orElseThrow(() -> new ValidacionProgramaException("El docente no pertenece al departamento"));
            if (!docente.isActivo() || !docente.hasRole(Rol.DOCENTE)) throw new ValidacionProgramaException("Debe seleccionar un docente activo");
            UsuarioDepartamentoEntity anterior = programa.getDocenteResponsable();
            programa.setDocenteResponsable(docente);
            if (anterior != null && !anterior.getId().equals(docente.getId())) {
                correo.sendEmailRemocionCargo(anterior.getEmail(), anterior.getUsuario(), "Docente responsable", "Materia", programa.getMateria().getNombre());
                correo.sendEmailAsignacionCargo(docente.getEmail(), docente.getUsuario(), "Docente responsable", "Materia", programa.getMateria().getNombre());
            }
        }
        if (datos.getCargaHorariaSemanal() != null) { positivo(datos.getCargaHorariaSemanal(), "Carga horaria semanal"); programa.setCargaHorariaSemanal(datos.getCargaHorariaSemanal()); }
        if (datos.getCantidadSemanas() != null) { positivo(datos.getCantidadSemanas(), "Cantidad de semanas"); programa.setCantidadSemanas(datos.getCantidadSemanas()); }
        if (datos.getCreditos() != null) { positivo(datos.getCreditos(), "Créditos"); programa.setCreditos(datos.getCreditos()); }
        if (programa.getCargaHorariaSemanal() != null && programa.getCantidadSemanas() != null)
            programa.setCargaHorariaTotal(Math.multiplyExact(programa.getCargaHorariaSemanal(), programa.getCantidadSemanas()));
    }

    private void cargarSecretaria(ProgramaEntity programa, ProgramaCargaDTO datos, UsuarioDepartamentoEntity actor) {
        cargarAdministracion(programa, datos, actor, false);
        if (datos.getContenidosMinimos() != null) programa.setContenidosMinimos(datos.getContenidosMinimos());
        if (datos.getBloqueMultiple() == null) return;
        Map<Long, ProgramaCarreraEntity> anteriores = new HashMap<>();
        programa.getBloqueMultiple().forEach(pc -> anteriores.put(pc.getCarreraPlan().getId(), pc));
        Set<Long> incluidos = new HashSet<>();
        List<ProgramaCarreraEntity> nuevos = new ArrayList<>();
        for (ProgramaCarreraCreateDTO entrada : datos.getBloqueMultiple()) {
            if (entrada.getCarreraPlanId() == null || !incluidos.add(entrada.getCarreraPlanId()))
                throw new ValidacionProgramaException("Cada bloque debe tener un plan distinto");
            CarreraPlanEntity plan = planes.findById(entrada.getCarreraPlanId()).orElseThrow(() -> new EntityNotFoundException("Plan no existente"));
            ProgramaCarreraEntity pc = anteriores.getOrDefault(plan.getId(), new ProgramaCarreraEntity());
            pc.setPrograma(programa); pc.setCarreraPlan(plan); pc.setUbicacionEnPlan(entrada.getUbicacionEnPlan());
            List<Long> fuertes = entrada.getCorrelativasFuertesIds() == null ? List.of() : entrada.getCorrelativasFuertesIds();
            List<Long> debiles = entrada.getCorrelativasDebilesIds() == null ? List.of() : entrada.getCorrelativasDebilesIds();
            if (fuertes.contains(programa.getMateria().getId()) || debiles.contains(programa.getMateria().getId())
                    || fuertes.stream().anyMatch(debiles::contains)) throw new ValidacionProgramaException("Correlativas inválidas");
            pc.setCorrelativasFuertes(new ArrayList<>(materias.findAllById(fuertes)));
            pc.setCorrelativasDebiles(new ArrayList<>(materias.findAllById(debiles)));
            if (pc.getCorrelativasFuertes().size() != fuertes.size() || pc.getCorrelativasDebiles().size() != debiles.size())
                throw new ValidacionProgramaException("Alguna correlativa no existe o está repetida");
            // La contribución existente se conserva: únicamente CCC puede modificarla.
            nuevos.add(pc);
        }
        for (ProgramaCarreraEntity eliminado : programa.getBloqueMultiple()) {
            if (!incluidos.contains(eliminado.getCarreraPlan().getId())) {
                programa.getDecisionesComision().stream()
                        .filter(d -> d.getProgramaCarrera() == eliminado
                                || (d.getProgramaCarrera() != null && eliminado.getId() != null
                                && eliminado.getId().equals(d.getProgramaCarrera().getId())))
                        .forEach(d -> d.setProgramaCarrera(null));
            }
        }
        programa.getBloqueMultiple().removeIf(pc -> !incluidos.contains(pc.getCarreraPlan().getId()));
        nuevos.stream().filter(pc -> !programa.getBloqueMultiple().contains(pc)).forEach(programa.getBloqueMultiple()::add);
    }

    private void cargarDocente(ProgramaEntity p, ProgramaCargaDTO d) {
        if (d.getCargaHorariaPractica() != null) { positivo(d.getCargaHorariaPractica(), "Carga práctica"); p.setCargaHorariaPractica(d.getCargaHorariaPractica()); }
        if (d.getFundamentacion() != null) p.setFundamentacion(d.getFundamentacion());
        if (d.getObjetivos() != null) p.setObjetivos(d.getObjetivos());
        if (d.getProgramaAnalitico() != null) p.setProgramaAnalitico(d.getProgramaAnalitico());
        if (d.getMetodologia() != null) p.setMetodologia(d.getMetodologia());
        if (d.getModalidadEvaluacion() != null) p.setModalidadEvaluacion(d.getModalidadEvaluacion());
        if (d.getBibliografia() != null) p.setBibliografia(d.getBibliografia());
    }

    private void validarAdministracion(ProgramaEntity p) {
        if (p.getMateria() == null || p.getDocenteResponsable() == null) throw new ValidacionProgramaException("Materia y docente son obligatorios");
        positivo(p.getCargaHorariaSemanal(), "Carga horaria semanal"); positivo(p.getCantidadSemanas(), "Cantidad de semanas"); positivo(p.getCreditos(), "Créditos");
    }

    private void validarDocente(ProgramaEntity p) {
        positivo(p.getCargaHorariaPractica(), "Carga práctica");
        exigirTexto(p.getFundamentacion(), "Complete la fundamentación"); exigirTexto(p.getObjetivos(), "Complete los objetivos");
        exigirTexto(p.getProgramaAnalitico(), "Complete el programa analítico"); exigirTexto(p.getMetodologia(), "Complete la metodología");
        exigirTexto(p.getModalidadEvaluacion(), "Complete la evaluación"); exigirTexto(p.getBibliografia(), "Complete la bibliografía");
    }

    private void validarBloques(ProgramaEntity p) {
        if (p.getBloqueMultiple().isEmpty()) throw new ValidacionProgramaException("Debe agregar al menos una carrera y plan");
        for (ProgramaCarreraEntity pc : p.getBloqueMultiple()) {
            exigirTexto(pc.getUbicacionEnPlan(), "Complete la ubicación en el plan");
            UsuarioDepartamentoEntity ccc = pc.getCarreraPlan().getCarrera().getComision();
            if (ccc == null || !ccc.isActivo() || !ccc.hasRole(Rol.COORDINACION_COMISION_CURRICULAR))
                throw new IllegalStateException("Debe asignar CCC activa a la carrera " + pc.getCarreraPlan().getCarrera().getNombre());
        }
    }

    private void abrirComisiones(ProgramaEntity p) {
        validarBloques(p);
        cerrarDecisiones(p);
        p.setRondaRevision((p.getRondaRevision() == null ? 0 : p.getRondaRevision()) + 1);
        for (ProgramaCarreraEntity pc : p.getBloqueMultiple()) {
            DecisionComisionEntity decision = new DecisionComisionEntity();
            decision.setPrograma(p);
            decision.setProgramaCarrera(pc);
            decision.setRonda(p.getRondaRevision());
            decision.setCarreraPlanId(pc.getCarreraPlan().getId());
            decision.setCarreraNombre(pc.getCarreraPlan().getCarrera().getNombre());
            decision.setPlanAnio(pc.getCarreraPlan().getAnio());
            decision.setPlanVersion(pc.getCarreraPlan().getVersion());
            p.getDecisionesComision().add(decision);
            decisiones.save(decision);
            correo.sendEmailNotificacionCargaDocente(pc.getCarreraPlan().getCarrera().getComision().getEmail(), p, pc.getCarreraPlan().getCarrera());
        }
    }

    private void cerrarDecisiones(ProgramaEntity p) {
        for (DecisionComisionEntity decision : p.getDecisionesComision()) {
            if (Objects.equals(decision.getRonda(), p.getRondaRevision())
                    && decision.getResultado() == ResultadoDecisionComision.PENDIENTE) {
                // El cierre no se presenta como una decisión del coordinador que todavía no intervino.
                decision.setResultado(ResultadoDecisionComision.CANCELADA);
                decision.setFechaDecision(ahora());
            }
        }
    }

    private ProgramaCarreraEntity bloquePendiente(ProgramaEntity p, Long planId, UsuarioDepartamentoEntity actor) {
        ProgramaCarreraEntity pc = p.getBloqueMultiple().stream().filter(b -> b.getCarreraPlan().getId().equals(planId))
                .findFirst().orElseThrow(() -> new AccessDeniedException("El bloque no pertenece al programa"));
        if (pc.getCarreraPlan().getCarrera().getComision() == null || !pc.getCarreraPlan().getCarrera().getComision().getId().equals(actor.getId()))
            throw new AccessDeniedException("No coordina esta carrera");
        if (pc.getDecisionComision() == null || pc.getDecisionComision().getResultado() != ResultadoDecisionComision.PENDIENTE)
            throw new ConflictoProgramaException("La decisión de este bloque ya está cerrada para esta ronda");
        return pc;
    }

    private void notificarRechazoComisiones(ProgramaEntity p, UsuarioDepartamentoEntity actor, ProgramaCarreraEntity bloque, EstadoUpdateDTO d) {
        Set<Long> avisados = new HashSet<>();
        for (ProgramaCarreraEntity pc : p.getBloqueMultiple()) {
            UsuarioDepartamentoEntity ccc = pc.getCarreraPlan().getCarrera().getComision();
            if (ccc != null && !ccc.getId().equals(actor.getId()) && avisados.add(ccc.getId()))
                correo.sendEmailNotificacionRechazoOtrasComisiones(ccc.getEmail(), ccc.getUsuario(), actor.getUsuario(), p.getMateria(),
                        bloque.getCarreraPlan().getCarrera(), d.getDestinoRechazo(), d.getJustificacion());
        }
    }

    private void registrarDecision(DecisionComisionEntity decision, ResultadoDecisionComision resultado,
                                   UsuarioDepartamentoEntity actor, String justificacion, Rol destino) {
        decision.setResultado(resultado);
        decision.setActor(actor);
        decision.setFechaDecision(ahora());
        decision.setJustificacion(justificacion);
        decision.setDestinoRechazo(destino);
    }

    private LocalDateTime ahora() {
        return LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires"));
    }
    private void positivo(Integer valor, String nombre) { if (valor == null || valor <= 0) throw new ValidacionProgramaException(nombre + " debe ser mayor que cero"); }
    private void exigirTexto(String valor, String mensaje) { if (valor == null || valor.isBlank()) throw new ValidacionProgramaException(mensaje); }
}

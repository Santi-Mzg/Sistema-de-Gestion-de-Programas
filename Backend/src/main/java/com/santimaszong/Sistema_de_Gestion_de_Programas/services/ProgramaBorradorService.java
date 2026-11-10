package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.ConflictoProgramaException;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.ValidacionProgramaException;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaDraftDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.utils.CircuitoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.ContextoPrograma;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;

@Service
@RequiredArgsConstructor
@Transactional
public class ProgramaBorradorService {
    private final ProgramaDraftRepository drafts;
    private final ProgramaRepository programas;
    private final MateriaRepository materias;
    private final ContextoPrograma contexto;

    public ProgramaDraftDTO operar(String legajo, Long deptId, Long materiaId, Rol rol, Integer anio,
            Long programaId, Long planId, String operacion, ProgramaDraftDTO datos) {
        if (anio == null || anio < 1) throw new ValidacionProgramaException("Debe indicar el año del borrador");
        UsuarioDepartamentoEntity actor = contexto.exigir(legajo, deptId, rol);
        if (programaId == null) programaId = 0L;
        if (planId == null) planId = 0L;
        if (programaId == 0) {
            if (operacion.equals("GUARDAR") && programas.existsByMateriaIdAndAnio(materiaId, anio))
                throw new ConflictoProgramaException("El programa ya fue creado; no se puede recrear su borrador inicial");
            if (rol != Rol.ADMINISTRACION || planId != 0) throw new AccessDeniedException("Solo Administración inicia borradores de creación");
            MateriaEntity materia = materias.findById(materiaId).orElseThrow(() -> new ValidacionProgramaException("Materia no existente"));
            if (!materia.getDepartamento().getId().equals(deptId)) throw new AccessDeniedException("La materia no pertenece al departamento activo");
        } else {
            ProgramaEntity p = programas.findForUpdateById(programaId).orElseThrow(() -> new ValidacionProgramaException("Programa no existente"));
            contexto.consultar(p, actor, rol);
            if (!p.getMateria().getId().equals(materiaId) || !p.getAnio().equals(anio)) throw new AccessDeniedException("El borrador no corresponde al programa");
            boolean editable = switch (rol) {
                case ADMINISTRACION -> p.getEstadoActual() == EstadoPrograma.RECHAZADO_A_ADMINISTRACION;
                case SECRETARIA -> CircuitoPrograma.esSecretariaInicial(p.getEstadoActual());
                case DOCENTE -> CircuitoPrograma.esCargaDocente(p.getEstadoActual());
                case COORDINACION_COMISION_CURRICULAR -> p.getEstadoActual() == EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES;
                default -> false;
            };
            if (!editable && !operacion.equals("ELIMINAR")) throw new ConflictoProgramaException("El programa ya no admite borradores en esta etapa");
            if (rol == Rol.COORDINACION_COMISION_CURRICULAR) {
                final Long bloquePlanId = planId;
                ProgramaCarreraEntity bloque = p.getBloqueMultiple().stream().filter(pc -> pc.getCarreraPlan().getId().equals(bloquePlanId))
                        .findFirst().orElseThrow(() -> new AccessDeniedException("Bloque no existente"));
                if (bloque.getCarreraPlan().getCarrera().getComision() == null || !bloque.getCarreraPlan().getCarrera().getComision().getId().equals(actor.getId()))
                    throw new AccessDeniedException("El bloque no pertenece a sus carreras");
                if (operacion.equals("GUARDAR") && (bloque.getDecisionComision() == null
                        || bloque.getDecisionComision().getResultado() != com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.ResultadoDecisionComision.PENDIENTE))
                    throw new ConflictoProgramaException("La decisión del bloque ya está cerrada");
            } else if (planId != 0) throw new ValidacionProgramaException("Esta etapa no admite un borrador por bloque");
        }
        var existente = drafts.findByUsuarioIdAndMateriaIdAndAnioAndRolAndProgramaIdAndPlanId(actor.getUsuario().getId(), materiaId, anio, rol, programaId, planId);
        if (operacion.equals("ELIMINAR")) { existente.ifPresent(drafts::delete); return null; }
        if (operacion.equals("LEER")) return existente.map(d -> new ProgramaDraftDTO(d.getPayloadJson())).orElse(null);
        if (datos == null || datos.getPayloadJson() == null) throw new ValidacionProgramaException("Falta el contenido del borrador");
        ProgramaDraftEntity d = existente.orElseGet(ProgramaDraftEntity::new);
        d.setUsuarioId(actor.getUsuario().getId()); d.setMateriaId(materiaId); d.setAnio(anio); d.setRol(rol);
        d.setProgramaId(programaId); d.setPlanId(planId); d.setPayloadJson(datos.getPayloadJson()); d.setLastUpdated(LocalDateTime.now());
        drafts.save(d);
        return datos;
    }
}

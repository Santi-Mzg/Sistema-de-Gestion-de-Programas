package com.santimaszong.Sistema_de_Gestion_de_Programas.security;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UsuarioDepartamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContextoPrograma {
    private final UsuarioDepartamentoRepository usuarios;

    public UsuarioDepartamentoEntity exigir(String legajo, Long departamentoId, Rol rol) {
        UsuarioDepartamentoEntity vinculo = usuarios.findByUsuarioLegajoAndDepartamentoId(legajo, departamentoId)
                .orElseThrow(() -> new AccessDeniedException("No tiene acceso al departamento seleccionado"));
        if (!vinculo.isActivo() || !vinculo.getUsuario().isEnabled() || rol == null || !vinculo.hasRole(rol))
            throw new AccessDeniedException("No tiene el rol activo requerido en este departamento");
        return vinculo;
    }

    public void consultarActual(ProgramaEntity programa) {
        var attrs = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
        if (!(attrs instanceof org.springframework.web.context.request.ServletRequestAttributes servlet))
            throw new AccessDeniedException("No hay un contexto de consulta seleccionado");
        try {
            Long deptId = Long.valueOf(servlet.getRequest().getHeader("X-Departamento-Activo"));
            Rol rol = Rol.valueOf(servlet.getRequest().getHeader("X-Rol-Activo"));
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) throw new AccessDeniedException("Debe iniciar sesión");
            consultar(programa, exigir(auth.getName(), deptId, rol), rol);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new AccessDeniedException("Seleccione un departamento y rol activos");
        }
    }

    public boolean puedeConsultarActual(ProgramaEntity programa) {
        try { consultarActual(programa); return true; }
        catch (AccessDeniedException ex) { return false; }
    }

    public void consultar(ProgramaEntity programa, UsuarioDepartamentoEntity actor, Rol rol) {
        if (rol == Rol.COORDINACION_COMISION_CURRICULAR) {
            boolean asignado = programa.getBloqueMultiple().stream().anyMatch(b ->
                    b.getCarreraPlan().getCarrera().getComision() != null
                    && b.getCarreraPlan().getCarrera().getComision().getId().equals(actor.getId()));
            if (!asignado) throw new AccessDeniedException("El programa no corresponde a sus carreras");
            return;
        }
        if (!programa.getMateria().getDepartamento().getId().equals(actor.getDepartamento().getId()))
            throw new AccessDeniedException("El programa no pertenece al departamento activo");
        if (rol == Rol.DOCENTE && (programa.getDocenteResponsable() == null
                || !programa.getDocenteResponsable().getId().equals(actor.getId())))
            throw new AccessDeniedException("No es el docente responsable del programa");
        if (rol == Rol.COORDINADOR_AREA && (programa.getMateria().getArea().getCoordinador() == null
                || !programa.getMateria().getArea().getCoordinador().getId().equals(actor.getId())))
            throw new AccessDeniedException("El programa no pertenece a sus áreas");
    }
}

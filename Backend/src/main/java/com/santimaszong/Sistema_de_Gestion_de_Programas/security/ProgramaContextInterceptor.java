package com.santimaszong.Sistema_de_Gestion_de_Programas.security;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ProgramaContextInterceptor implements HandlerInterceptor {
    private final ContextoPrograma contexto;
    private final ProgramaRepository programas;
    private final AreaRepository areas;
    private final MateriaRepository materias;

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        if (req.getMethod().equals("OPTIONS")) return true;
        Long dept;
        Rol rol;
        try {
            dept = Long.valueOf(req.getHeader("X-Departamento-Activo"));
            rol = Rol.valueOf(req.getHeader("X-Rol-Activo"));
        } catch (RuntimeException ex) { throw new AccessDeniedException("Seleccione un departamento y rol activos"); }
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new AccessDeniedException("Debe iniciar sesión");
        UsuarioDepartamentoEntity actor = contexto.exigir(auth.getName(), dept, rol);
        String rolParam = req.getParameter("rolActivo");
        if (rolParam != null && !rol.name().equals(rolParam)) throw new AccessDeniedException("El rol de la operación no coincide con el rol activo");
        @SuppressWarnings("unchecked")
        Map<String,String> vars = (Map<String,String>) req.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        String uri = req.getRequestURI();
        if (vars != null && vars.containsKey("deptId") && !dept.toString().equals(vars.get("deptId")))
            throw new AccessDeniedException("La operación no corresponde al departamento activo");
        if (uri.endsWith("/administrativo-carga") || (req.getMethod().equals("POST") && uri.matches(".*/departamentos/[^/]+/programas"))) exigirRol(rol, Rol.ADMINISTRACION);
        if (uri.endsWith("/docente-carga") || uri.endsWith("/profesor-carga")) exigirRol(rol, Rol.DOCENTE);
        if (uri.endsWith("/secretaria-carga")) exigirRol(rol, Rol.SECRETARIA);
        if (uri.endsWith("/mis-areas")) exigirRol(rol, Rol.COORDINADOR_AREA);
        if (vars != null && vars.containsKey("id") && uri.matches(".*/programas/[0-9]+(?:/.*)?")) {
            ProgramaEntity p = programas.findById(Long.valueOf(vars.get("id"))).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Programa no existente"));
            contexto.consultar(p, actor, rol);
            if (req.getMethod().equals("DELETE") && rol != Rol.SECRETARIA && rol != Rol.SYSTEM_ADMIN)
                throw new AccessDeniedException("Solo Secretaría o Administrador del Sistema pueden eliminar programas");
            if (uri.endsWith("/pdf") && ((rol != Rol.SECRETARIA && rol != Rol.SYSTEM_ADMIN) || p.getEstadoActual() != EstadoPrograma.APROBADO))
                throw new AccessDeniedException("Solo se permite el PDF de programas aprobados con el rol correspondiente");
        }
        if (vars != null && vars.containsKey("id") && uri.matches(".*/areas/[0-9]+(?:/.*)?")) {
            AreaEntity area = areas.findById(Long.valueOf(vars.get("id"))).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Área no existente"));
            if (!area.getDepartamento().getId().equals(dept)) throw new AccessDeniedException("El área no pertenece al departamento activo");
            if (rol == Rol.COORDINADOR_AREA && (area.getCoordinador() == null || !area.getCoordinador().getId().equals(actor.getId())))
                throw new AccessDeniedException("El área no está asignada al coordinador");
            if (!req.getMethod().equals("GET") && rol != Rol.SECRETARIA && rol != Rol.DIRECCION_ADMINISTRATIVA && rol != Rol.SYSTEM_ADMIN)
                throw new AccessDeniedException("No puede modificar el área");
        }
        return true;
    }
    private void exigirRol(Rol actual, Rol requerido) {
        if (actual != requerido) throw new AccessDeniedException("Seleccione el rol correspondiente a esta acción");
    }
}

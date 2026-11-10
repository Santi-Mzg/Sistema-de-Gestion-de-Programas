package com.santimaszong.Sistema_de_Gestion_de_Programas.security;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UsuarioDepartamentoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ContextoProgramaTest {
    UsuarioDepartamentoRepository usuarios = mock(UsuarioDepartamentoRepository.class);
    ContextoPrograma contexto = new ContextoPrograma(usuarios);
    UsuarioDepartamentoEntity actor() {
        DepartamentoEntity dept = new DepartamentoEntity(); dept.setId(1L);
        UserEntity user = new UserEntity(); user.setEnabled(true);
        UsuarioDepartamentoEntity actor = new UsuarioDepartamentoEntity(); actor.setId(10L); actor.setDepartamento(dept); actor.setUsuario(user);
        return actor;
    }
    ProgramaEntity programa(UsuarioDepartamentoEntity docente) {
        AreaEntity area = new AreaEntity(); area.setId(2L);
        MateriaEntity materia = new MateriaEntity(); materia.setArea(area); materia.setDepartamento(docente.getDepartamento());
        ProgramaEntity p = new ProgramaEntity(); p.setMateria(materia); p.setDocenteResponsable(docente); return p;
    }
    @Test void docenteNoConsultaElProgramaDeOtroResponsable() {
        UsuarioDepartamentoEntity docente = actor(); UsuarioDepartamentoEntity otro = actor(); otro.setId(11L);
        assertThatThrownBy(() -> contexto.consultar(programa(docente), otro, Rol.DOCENTE)).isInstanceOf(AccessDeniedException.class);
    }
    @Test void areaNoConsultaProgramasDeAreasNoAsignadas() {
        UsuarioDepartamentoEntity actor = actor();
        assertThatThrownBy(() -> contexto.consultar(programa(actor), actor, Rol.COORDINADOR_AREA)).isInstanceOf(AccessDeniedException.class);
    }
    @Test void areaPuedeConsultarSuPrograma() {
        UsuarioDepartamentoEntity actor = actor(); ProgramaEntity p = programa(actor); p.getMateria().getArea().setCoordinador(actor);
        assertThatCode(() -> contexto.consultar(p, actor, Rol.COORDINADOR_AREA)).doesNotThrowAnyException();
    }
    @Test void otroDepartamentoQuedaFueraDelAlcance() {
        UsuarioDepartamentoEntity actor = actor(); ProgramaEntity p = programa(actor);
        DepartamentoEntity otro = new DepartamentoEntity(); otro.setId(99L); p.getMateria().setDepartamento(otro);
        assertThatThrownBy(() -> contexto.consultar(p, actor, Rol.ADMINISTRACION)).isInstanceOf(AccessDeniedException.class);
    }
    @Test void tenerOtroRolNoSustituyeElRolSeleccionado() {
        UsuarioDepartamentoEntity actor = actor(); actor.getRoles().add(Rol.DOCENTE);
        when(usuarios.findByUsuarioLegajoAndDepartamentoId("100", 1L)).thenReturn(Optional.of(actor));
        assertThatThrownBy(() -> contexto.exigir("100", 1L, Rol.SECRETARIA)).isInstanceOf(AccessDeniedException.class);
    }
    @Test void usuarioDeshabilitadoNoPuedeActuarConUnTokenAnterior() {
        UsuarioDepartamentoEntity actor = actor(); actor.getRoles().add(Rol.DOCENTE); actor.getUsuario().setEnabled(false);
        when(usuarios.findByUsuarioLegajoAndDepartamentoId("100", 1L)).thenReturn(Optional.of(actor));
        assertThatThrownBy(() -> contexto.exigir("100", 1L, Rol.DOCENTE)).isInstanceOf(AccessDeniedException.class);
    }
}

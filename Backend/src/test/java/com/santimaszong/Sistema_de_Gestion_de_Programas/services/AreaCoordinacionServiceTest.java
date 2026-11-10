package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.ContextoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.AreaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl.AreaServiceImpl;
import org.junit.jupiter.api.*;
import org.springframework.security.access.AccessDeniedException;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class AreaCoordinacionServiceTest {
    AreaRepository areas = mock(AreaRepository.class);
    UsuarioDepartamentoRepository usuarios = mock(UsuarioDepartamentoRepository.class);
    ContextoPrograma contexto = mock(ContextoPrograma.class);
    ProgramaWorkflowService circuito = mock(ProgramaWorkflowService.class);
    EmailService correo = mock(EmailService.class);
    AreaService service = new AreaServiceImpl(mock(DepartamentoService.class), areas, mock(AreaMapper.class),
            usuarios, contexto, circuito, correo, mock(com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.UserReducedMapper.class));
    DepartamentoEntity departamento;
    UsuarioDepartamentoEntity anterior;
    AreaEntity area;
    @BeforeEach void preparar() {
        departamento = new DepartamentoEntity(); departamento.setId(1L);
        anterior = new UsuarioDepartamentoEntity(); anterior.setId(20L); anterior.setDepartamento(departamento);
        UserEntity usuario = new UserEntity(); usuario.setId(5L); anterior.setUsuario(usuario);
        anterior.getRoles().add(Rol.COORDINADOR_AREA);
        area = new AreaEntity(); area.setId(10L); area.setNombre("Área de prueba"); area.setDepartamento(departamento); area.setCoordinador(anterior);
        when(areas.findForUpdateById(10L)).thenReturn(Optional.of(area));
        when(contexto.exigir("actor", 1L, Rol.SECRETARIA)).thenReturn(anterior);
    }
    @Test void conservaRolSiCoordinaOtraArea() {
        when(areas.countByCoordinadorId(20L)).thenReturn(1L);
        service.updateCoordinador("actor", 1L, Rol.SECRETARIA, 10L, null);
        assertThat(anterior.hasRole(Rol.COORDINADOR_AREA)).isTrue();
        verify(circuito).omitirArea(area, anterior, Rol.SECRETARIA);
        verify(correo).sendEmailRemocionCoordinadorArea(anterior, area);
    }
    @Test void retiraRolAlDejarLaUltimaAreaInclusoSiEsAdministrador() {
        anterior.getUsuario().setAdmin(true);
        service.updateCoordinador("actor", 1L, Rol.SECRETARIA, 10L, null);
        assertThat(anterior.hasRole(Rol.COORDINADOR_AREA)).isFalse();
        assertThat(area.getCoordinador()).isNull();
    }
    @Test void noPermiteAsignarUsuarioDeOtroDepartamento() {
        when(usuarios.findByUsuarioIdAndDepartamentoId(99L, 1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.updateCoordinador("actor", 1L, Rol.SECRETARIA, 10L, 99L)).isInstanceOf(IllegalArgumentException.class);
        assertThat(area.getCoordinador()).isSameAs(anterior);
        verifyNoInteractions(correo, circuito);
    }
    @Test void reemplazarNoAvanzaLosProgramas() {
        UsuarioDepartamentoEntity nuevo = new UsuarioDepartamentoEntity(); nuevo.setId(21L); nuevo.setUsuario(new UserEntity());
        when(usuarios.findByUsuarioIdAndDepartamentoId(6L, 1L)).thenReturn(Optional.of(nuevo));
        service.updateCoordinador("actor", 1L, Rol.SECRETARIA, 10L, 6L);
        assertThat(nuevo.hasRole(Rol.COORDINADOR_AREA)).isTrue();
        assertThat(area.getCoordinador()).isSameAs(nuevo);
        verify(correo).sendEmailRemocionCoordinadorArea(anterior, area);
        verify(correo).sendEmailAsignacionCoordinadorArea(nuevo, area);
        verifyNoMoreInteractions(correo);
        verifyNoInteractions(circuito);
    }
    @Test void docenteNoPuedeAsignarCoordinador() {
        when(contexto.exigir("actor", 1L, Rol.DOCENTE)).thenReturn(anterior);
        assertThatThrownBy(() -> service.updateCoordinador("actor", 1L, Rol.DOCENTE, 10L, null)).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(correo, circuito);
    }
}

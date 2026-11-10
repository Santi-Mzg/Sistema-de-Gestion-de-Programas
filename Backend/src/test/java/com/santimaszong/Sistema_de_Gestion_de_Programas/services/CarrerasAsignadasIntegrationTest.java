package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.controller.CarreraController;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.ContextoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl.CarreraServiceImpl;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
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
import org.springframework.test.context.*;

import java.util.EnumSet;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@DataJpaTest(showSql = false)
@TestPropertySource(locations = "classpath:application-ci.properties")
@ContextConfiguration(classes = CarrerasAsignadasIntegrationTest.Config.class)
@Import({CarreraServiceImpl.class, ContextoPrograma.class})
class CarrerasAsignadasIntegrationTest {
    @Configuration
    @EnableAutoConfiguration
    @EntityScan(basePackageClasses = CarreraEntity.class)
    @EnableJpaRepositories(basePackageClasses = CarreraRepository.class)
    static class Config { }

    @Autowired EntityManager em;
    @Autowired CarreraService servicio;
    @MockBean DepartamentoService departamentos;
    @MockBean UsuarioDepartamentoService usuarios;
    @MockBean CarreraMapper mapper;
    @MockBean CarreraPlanMapper planes;
    @MockBean EmailService correos;

    DepartamentoEntity departamento, otroDepartamento;
    UsuarioDepartamentoEntity coordinador;
    final Pageable pagina = PageRequest.of(0, 10, Sort.by("nombre").and(Sort.by("id")));

    @BeforeEach
    void preparar() {
        departamento = departamento("A"); otroDepartamento = departamento("B");
        UserEntity usuario = usuario("ccc-local");
        coordinador = vinculo(usuario, departamento);
        UsuarioDepartamentoEntity otro = vinculo(usuario("otra-ccc"), departamento);
        UsuarioDepartamentoEntity mismoUsuarioOtroDepto = vinculo(usuario, otroDepartamento);
        carrera("AA ajena", departamento, otro);
        carrera("AB asignada", departamento, coordinador);
        carrera("AC asignada", departamento, coordinador);
        carrera("AD otro departamento", otroDepartamento, mismoUsuarioOtroDepto);
        carrera("AE sin coordinación", departamento, null);
        em.flush();
        when(mapper.toDTO(any(CarreraEntity.class))).thenAnswer(invocacion -> {
            CarreraEntity entidad = invocacion.getArgument(0);
            CarreraResponseDTO dto = new CarreraResponseDTO(); dto.setId(entidad.getId()); dto.setNombre(entidad.getNombre()); return dto;
        });
    }

    @Test
    void soloListaAsignadasAlVinculoDelDepartamentoActivo() {
        assertThat(consultar(null, pagina).getContent()).extracting(CarreraResponseDTO::getNombre)
                .containsExactly("AB asignada", "AC asignada");
        verifyNoInteractions(correos);
    }

    @Test
    void filtraAntesDePaginarYCuentaSoloLasAsignadas() {
        Page<CarreraResponseDTO> resultado = consultar("  ASIGNADA  ", PageRequest.of(1, 1, pagina.getSort()));
        assertThat(resultado.getTotalElements()).isEqualTo(2);
        assertThat(resultado.getTotalPages()).isEqualTo(2);
        assertThat(resultado.getContent()).extracting(CarreraResponseDTO::getNombre).containsExactly("AC asignada");
        assertThat(consultar("ajena", pagina)).isEmpty();
    }

    @Test
    void sinAsignacionesDevuelveUnaPaginaVacia() {
        em.createQuery("update CarreraEntity c set c.comision = null where c.comision.id = :id")
                .setParameter("id", coordinador.getId()).executeUpdate();
        assertThat(consultar("", pagina).getTotalElements()).isZero();
    }

    @Test
    void deniegaRolActivoDiferenteAunqueElUsuarioTengaAmbosRoles() {
        assertThatThrownBy(() -> servicio.listCarrerasAsignadas(departamento.getId(), "ccc-local", Rol.ADMINISTRACION, "", pagina))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void deniegaUnaCoordinacionNoAsignadaAlUsuario() {
        coordinador.getRoles().remove(Rol.COORDINACION_COMISION_CURRICULAR); em.flush();
        assertThatThrownBy(() -> consultar("", pagina)).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void deniegaUsuarioSinVinculoConElDepartamento() {
        assertThatThrownBy(() -> servicio.listCarrerasAsignadas(departamento.getId(), "sin-vinculo", Rol.COORDINACION_COMISION_CURRICULAR, "", pagina))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void deniegaVinculoInactivo() {
        coordinador.setActivo(false); em.flush();
        assertThatThrownBy(() -> consultar("", pagina)).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void deniegaUsuarioDeshabilitado() {
        coordinador.getUsuario().setEnabled(false); em.flush();
        assertThatThrownBy(() -> consultar("", pagina)).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void controladorDeniegaDepartamentoDiscrepanteOSinAutenticacion() {
        CarreraService simulado = mock(CarreraService.class);
        CarreraController controlador = new CarreraController(simulado);
        var auth = new UsernamePasswordAuthenticationToken("ccc-local", null);
        assertThatThrownBy(() -> controlador.listCarrerasAsignadas(departamento.getId(), otroDepartamento.getId(),
                Rol.COORDINACION_COMISION_CURRICULAR, "", 0, 10, auth)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> controlador.listCarrerasAsignadas(departamento.getId(), departamento.getId(),
                Rol.COORDINACION_COMISION_CURRICULAR, "", 0, 10, null)).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(simulado);
    }

    private Page<CarreraResponseDTO> consultar(String search, Pageable pageable) {
        return servicio.listCarrerasAsignadas(departamento.getId(), "ccc-local", Rol.COORDINACION_COMISION_CURRICULAR, search, pageable);
    }
    private DepartamentoEntity departamento(String nombre) {
        DepartamentoEntity d = new DepartamentoEntity(); d.setNombre(nombre); d.setDireccion("Sintética");
        d.setTelefono("000"); d.setEmail(nombre + "@example.invalid"); em.persist(d); return d;
    }
    private UserEntity usuario(String legajo) {
        UserEntity u = new UserEntity(); u.setNombre("Persona"); u.setApellido("Sintética");
        u.setLegajo(legajo); u.setEnabled(true); em.persist(u); return u;
    }
    private UsuarioDepartamentoEntity vinculo(UserEntity usuario, DepartamentoEntity departamento) {
        UsuarioDepartamentoEntity v = new UsuarioDepartamentoEntity(); v.setUsuario(usuario); v.setDepartamento(departamento);
        v.setEmail(usuario.getLegajo() + departamento.getNombre() + "@example.invalid");
        v.getRoles().addAll(EnumSet.of(Rol.ADMINISTRACION, Rol.COORDINACION_COMISION_CURRICULAR)); em.persist(v); return v;
    }
    private void carrera(String nombre, DepartamentoEntity departamento, UsuarioDepartamentoEntity coordinador) {
        CarreraEntity c = new CarreraEntity(); c.setNombre(nombre); c.setDuracion("5 años");
        c.setDepartamento(departamento); c.setComision(coordinador); em.persist(c);
    }
}

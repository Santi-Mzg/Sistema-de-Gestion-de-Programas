package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.controller.MateriaController;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.MateriaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.ContextoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl.MateriaServiceImpl;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@DataJpaTest(showSql = false)
@TestPropertySource(locations = "classpath:application-ci.properties")
@ContextConfiguration(classes = MateriasSinProgramaIntegrationTest.Config.class)
@Import({MateriaServiceImpl.class, ContextoPrograma.class})
class MateriasSinProgramaIntegrationTest {
    @Configuration
    @EnableAutoConfiguration
    @EntityScan(basePackageClasses = ProgramaEntity.class)
    @EnableJpaRepositories(basePackageClasses = ProgramaRepository.class)
    static class Config {
        @Bean MateriaMapper materiaMapper() { return Mappers.getMapper(MateriaMapper.class); }
    }

    @Autowired EntityManager em;
    @Autowired MateriaService servicio;
    @MockBean CarreraService carreras;
    @MockBean AreaService areas;
    @MockBean ProgramaWorkflowService workflow;

    DepartamentoEntity departamento;
    DepartamentoEntity otroDepartamento;
    AreaEntity area;
    UserEntity usuario;
    UsuarioDepartamentoEntity vinculo;
    final int anio = LocalDate.now(ZoneId.of("America/Argentina/Buenos_Aires")).getYear();
    final Pageable pagina = PageRequest.of(0, 10, Sort.by("nombre").ascending().and(Sort.by("id")));

    @BeforeEach
    void preparar() {
        departamento = departamento("Local", "local@example.invalid");
        otroDepartamento = departamento("Otro", "otro@example.invalid");
        area = new AreaEntity(); area.setNombre("Área sintética"); area.setDepartamento(departamento); em.persist(area);
        usuario = new UserEntity(); usuario.setNombre("Persona"); usuario.setApellido("Sintética");
        usuario.setLegajo("fixture-consulta"); usuario.setEnabled(true); em.persist(usuario);
        vinculo = new UsuarioDepartamentoEntity(); vinculo.setUsuario(usuario); vinculo.setDepartamento(departamento);
        vinculo.setEmail("cuenta@example.invalid"); vinculo.getRoles().addAll(EnumSet.allOf(Rol.class)); em.persist(vinculo);
        materia("A", "Algoritmos", departamento);
        materia("B", "Bases", departamento);
        programa(materia("P", "Programa previo", departamento), anio - 1, EstadoPrograma.APROBADO);
        programa(materia("C", "Carga actual", departamento), anio, EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL);
        programa(materia("D", "Aprobado actual", departamento), anio, EstadoPrograma.APROBADO);
        materia("X", "Materia de otro departamento", otroDepartamento);
        em.flush();
    }

    @Test
    void incluyeMateriasSinProgramaActualAunqueTenganProgramaDeOtroAnio() {
        Page<MateriaResponseDTO> resultado = consultar(Rol.ADMINISTRACION, null, pagina);
        assertThat(resultado.getTotalElements()).isEqualTo(3);
        assertThat(resultado.getContent()).extracting(MateriaResponseDTO::getCodigo).containsExactly("A", "B", "P");
        assertThat(resultado.getContent()).allSatisfy(m -> assertThat(m.getDepartamento()).isEqualTo("Local"));
    }

    @Test
    void cualquierEstadoDelProgramaActualExcluyeLaMateria() {
        for (EstadoPrograma estado : EstadoPrograma.values()) {
            programa(materia("EST-" + estado.name(), "Estado " + estado.name(), departamento), anio, estado);
        }
        em.flush();
        assertThat(consultar(Rol.SECRETARIA, "", pagina).getTotalElements()).isEqualTo(3);
    }

    @Test
    void paginaOrdenadaYBusquedaPorNombreOCodigo() {
        Page<MateriaResponseDTO> segunda = consultar(Rol.SECRETARIA, "", PageRequest.of(1, 1, pagina.getSort()));
        assertThat(segunda.getTotalElements()).isEqualTo(3);
        assertThat(segunda.getTotalPages()).isEqualTo(3);
        assertThat(segunda.getContent()).extracting(MateriaResponseDTO::getCodigo).containsExactly("B");
        assertThat(consultar(Rol.SECRETARIA, "  algorit  ", pagina).getContent())
                .extracting(MateriaResponseDTO::getCodigo).containsExactly("A");
        assertThat(consultar(Rol.SECRETARIA, "b", pagina).getContent())
                .extracting(MateriaResponseDTO::getCodigo).containsExactly("B");
    }

    @ParameterizedTest
    @EnumSource(value = Rol.class, names = {"ADMINISTRACION", "SECRETARIA", "DIRECCION_ADMINISTRATIVA", "SYSTEM_ADMIN"})
    void admiteLosRolesDepartamentalesCorrespondientes(Rol rol) {
        assertThat(consultar(rol, "", pagina).getTotalElements()).isEqualTo(3);
    }

    @ParameterizedTest
    @EnumSource(value = Rol.class, names = {"DOCENTE", "COORDINACION_COMISION_CURRICULAR", "COORDINADOR_AREA"})
    void noAmpliaElAlcanceDeOtrosRolesAunqueElUsuarioPoseaVarios(Rol rol) {
        assertThatThrownBy(() -> consultar(rol, "", pagina)).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void deniegaDepartamentoSinVinculo() {
        assertThatThrownBy(() -> servicio.listMateriasSinPrograma(otroDepartamento.getId(), usuario.getLegajo(),
                Rol.ADMINISTRACION, "", pagina)).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void deniegaVinculoInactivo() {
        vinculo.setActivo(false); em.flush();
        assertThatThrownBy(() -> consultar(Rol.ADMINISTRACION, "", pagina)).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void deniegaUsuarioDeshabilitado() {
        usuario.setEnabled(false); em.flush();
        assertThatThrownBy(() -> consultar(Rol.ADMINISTRACION, "", pagina)).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void deniegaRolQueNoEstaAsignadoAlVinculo() {
        vinculo.getRoles().remove(Rol.SECRETARIA); em.flush();
        assertThatThrownBy(() -> consultar(Rol.SECRETARIA, "", pagina)).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void controladorRechazaUnaRutaQueNoCoincideConElDepartamentoActivo() {
        MateriaService servicioSimulado = mock(MateriaService.class);
        MateriaController controlador = new MateriaController(servicioSimulado);
        assertThatThrownBy(() -> controlador.listMateriasSinPrograma(departamento.getId(), otroDepartamento.getId(),
                Rol.ADMINISTRACION, "", 0, 10, null)).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(servicioSimulado);
    }

    private Page<MateriaResponseDTO> consultar(Rol rol, String search, Pageable pageable) {
        return servicio.listMateriasSinPrograma(departamento.getId(), usuario.getLegajo(), rol, search, pageable);
    }

    private DepartamentoEntity departamento(String nombre, String email) {
        DepartamentoEntity d = new DepartamentoEntity(); d.setNombre(nombre); d.setEmail(email);
        d.setDireccion("Dirección sintética"); d.setTelefono("000"); em.persist(d); return d;
    }

    private MateriaEntity materia(String codigo, String nombre, DepartamentoEntity d) {
        MateriaEntity m = new MateriaEntity(); m.setCodigo(codigo); m.setNombre(nombre); m.setDepartamento(d);
        if (d == departamento) m.setArea(area);
        em.persist(m); return m;
    }

    private void programa(MateriaEntity materia, int anio, EstadoPrograma estado) {
        ProgramaEntity p = new ProgramaEntity(); p.setMateria(materia); p.setAnio(anio); p.setEstadoActual(estado); em.persist(p);
    }
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.*;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests de integración para ProgramaRepository.
 *
 * Usa @DataJpaTest con H2 en memoria (configurado en src/test/resources/application.properties).
 * Cada test corre dentro de una transacción que se revierte al finalizar.
 *
 * Setup: @BeforeEach crea las entidades estructurales (dept, materia, usuarios, carrera, plan).
 * Los programas se crean en cada test para evitar conflictos de unicidad (materia+anio).
 */
@DataJpaTest
class ProgramaRepositoryTest {

    @Autowired private ProgramaRepository programaRepository;
    @Autowired private TestEntityManager em;

    // ── Entidades estructurales compartidas ───────────────────────────────
    private DepartamentoEntity dept;
    private MateriaEntity materia;
    private UsuarioDepartamentoEntity udeAdmin;
    private UsuarioDepartamentoEntity udeDocente;
    private UsuarioDepartamentoEntity udeCoord;
    private CarreraPlanEntity plan;

    // ═════════════════════════════════════════════════════════════════════
    // SETUP: entidades estructurales que necesitan todos los tests
    // ═════════════════════════════════════════════════════════════════════

    @BeforeEach
    void setUp() {
        // 1. Departamento
        dept = new DepartamentoEntity();
        dept.setNombre("Departamento de Ingeniería");
        dept.setDireccion("Alem 1253");
        dept.setTelefono("291-4595101");
        dept.setEmail("dept@uns.edu.ar");
        em.persist(dept);

        // 2. Usuarios (legajos únicos entre tests gracias al rollback por test)
        UserEntity adminUser = buildUser("admin001");
        UserEntity docenteUser = buildUser("docente001");
        UserEntity coordUser = buildUser("coord001");
        em.persist(adminUser);
        em.persist(docenteUser);
        em.persist(coordUser);

        // 3. UsuarioDepartamentoEntity con roles
        udeAdmin = buildUde(dept, adminUser, Rol.ADMINISTRACION);
        udeDocente = buildUde(dept, docenteUser, Rol.DOCENTE);
        udeCoord = buildUde(dept, coordUser, Rol.COORDINACION_COMISION_CURRICULAR);
        em.persist(udeAdmin);
        em.persist(udeDocente);
        em.persist(udeCoord);

        // 4. Materia
        materia = new MateriaEntity();
        materia.setNombre("Análisis Matemático");
        materia.setCodigo("MAT101");
        materia.setDepartamento(dept);
        em.persist(materia);

        // 5. Carrera coordinada por udeCoord
        CarreraEntity carrera = new CarreraEntity();
        carrera.setNombre("Ingeniería Civil");
        carrera.setDuracion("5 años");
        carrera.setDepartamento(dept);
        carrera.setComision(udeCoord);
        em.persist(carrera);

        // 6. Plan de estudios
        plan = new CarreraPlanEntity();
        plan.setAnio("2020");
        plan.setVersion(1);
        plan.setCarrera(carrera);
        em.persist(plan);

        em.flush();
    }

    // ═════════════════════════════════════════════════════════════════════
    // FIXTURE HELPERS
    // ═════════════════════════════════════════════════════════════════════

    private UserEntity buildUser(String legajo) {
        UserEntity u = new UserEntity();
        u.setNombre("Test");
        u.setApellido("User");
        u.setLegajo(legajo);
        u.setEnabled(true);
        return u;
    }

    private UsuarioDepartamentoEntity buildUde(DepartamentoEntity dept, UserEntity user, Rol... roles) {
        UsuarioDepartamentoEntity ude = new UsuarioDepartamentoEntity();
        ude.setUsuario(user);
        ude.setDepartamento(dept);
        ude.setEmail(user.getLegajo() + "@uns.edu.ar");
        ude.setRoles(new HashSet<>(Arrays.asList(roles)));
        return ude;
    }

    /** Crea un ProgramaEntity mínimo con materia, anio, profesor y estado. */
    private ProgramaEntity buildPrograma(MateriaEntity mat, int anio,
                                         UsuarioDepartamentoEntity profesor,
                                         EstadoPrograma estado) {
        ProgramaEntity p = new ProgramaEntity();
        p.setAnio(anio);
        p.setMateria(mat);
        p.setProfesorResponsable(profesor);
        p.setEstadoActual(estado);
        return p;
    }

    /**
     * Persiste un ProgramaCarreraEntity como hijo de un programa.
     * No modifica la colección en memoria del programa (el lado propietario
     * de la FK es ProgramaCarreraEntity.programa), lo que es suficiente
     * para que los JPQL que navegan pc→plan→carrera→comision funcionen.
     */
    private ProgramaCarreraEntity persistBloque(ProgramaEntity programa, CarreraPlanEntity plan) {
        ProgramaCarreraEntity bloque = new ProgramaCarreraEntity();
        bloque.setPrograma(programa);
        bloque.setCarreraPlan(plan);
        bloque.setCorrelativasFuertes(new ArrayList<>());
        bloque.setCorrelativasDebiles(new ArrayList<>());
        em.persist(bloque);
        return bloque;
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 1 – findByMateriaIdAndAnio()
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void findByMateriaIdAndAnio_givenExistingPrograma_whenQuery_thenReturnsCorrectPrograma() {
        // Given
        ProgramaEntity p = buildPrograma(materia, 2025, udeDocente, EstadoPrograma.COMPLETO_POR_ADMINISTRACION);
        em.persistAndFlush(p);

        // When
        Optional<ProgramaEntity> result = programaRepository.findByMateriaIdAndAnio(materia.getId(), 2025);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(p.getId());
        assertThat(result.get().getAnio()).isEqualTo(2025);
        assertThat(result.get().getMateria().getCodigo()).isEqualTo("MAT101");
    }

    @Test
    void findByMateriaIdAndAnio_givenNonExistingAnio_whenQuery_thenReturnsEmpty() {
        // Given
        em.persistAndFlush(buildPrograma(materia, 2025, udeDocente, EstadoPrograma.COMPLETO_POR_ADMINISTRACION));

        // When / Then
        assertThat(programaRepository.findByMateriaIdAndAnio(materia.getId(), 2099)).isEmpty();
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 2a – existsByMateriaIdAndAnio()
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void existsByMateriaIdAndAnio_givenExistingPrograma_whenCheck_thenReturnsTrue() {
        // Given
        em.persistAndFlush(buildPrograma(materia, 2025, udeDocente, EstadoPrograma.COMPLETO_POR_ADMINISTRACION));

        // When / Then
        assertThat(programaRepository.existsByMateriaIdAndAnio(materia.getId(), 2025)).isTrue();
        assertThat(programaRepository.existsByMateriaIdAndAnio(materia.getId(), 2099)).isFalse();
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 2b – deleteByMateriaIdAndAnio()
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void deleteByMateriaIdAndAnio_givenExistingPrograma_whenDelete_thenProgramaIsGone() {
        // Given – programa sin historial ni bloques para evitar complicaciones de cascade
        ProgramaEntity p = new ProgramaEntity();
        p.setAnio(2025);
        p.setMateria(materia);
        p.setEstadoActual(EstadoPrograma.INCOMPLETO_POR_ADMINISTRACION);
        em.persistAndFlush(p);

        assertThat(programaRepository.existsByMateriaIdAndAnio(materia.getId(), 2025)).isTrue();

        // When
        programaRepository.deleteByMateriaIdAndAnio(materia.getId(), 2025);
        em.flush();
        em.clear(); // vacía la caché L1 para que la siguiente consulta vaya a la BD

        // Then
        assertThat(programaRepository.existsByMateriaIdAndAnio(materia.getId(), 2025)).isFalse();
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 3 – findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoIdAndAnio()
    // Solo devuelve programas del docente cuyo legajo coincide
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void findByProfesorResponsable_givenTwoProgramasWithDifferentDocentes_whenQueryByLegajo_thenReturnsOnlyMatchingOne() {
        // Given – segundo docente y su programa en una materia distinta
        UserEntity otroDocente = buildUser("docente999");
        em.persist(otroDocente);
        UsuarioDepartamentoEntity udeOtroDocente = buildUde(dept, otroDocente, Rol.DOCENTE);
        em.persist(udeOtroDocente);

        MateriaEntity otraMateria = new MateriaEntity();
        otraMateria.setNombre("Álgebra Lineal");
        otraMateria.setCodigo("ALG101");
        otraMateria.setDepartamento(dept);
        em.persist(otraMateria);

        ProgramaEntity p1 = buildPrograma(materia, 2025, udeDocente, EstadoPrograma.COMPLETO_POR_ADMINISTRACION);
        ProgramaEntity p2 = buildPrograma(otraMateria, 2025, udeOtroDocente, EstadoPrograma.COMPLETO_POR_ADMINISTRACION);
        em.persist(p1);
        em.persist(p2);
        em.flush();

        // When
        List<ProgramaEntity> result = programaRepository
                .findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoIdAndAnio(
                        "docente001", dept.getId(), 2025);

        // Then – solo el programa de docente001, no el de docente999
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(p1.getId());
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 4 – findProgramasByCoordinadorLegajoAndAnio()
    // Solo devuelve programas de carreras cuya comision coincide con el legajo
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void findProgramasByCoordinador_givenTwoCarrerasWithDifferentCoords_whenQueryByCoord_thenReturnsOnlyHisPrograms() {
        // Given – segunda carrera coordinada por coord999
        UserEntity coord2User = buildUser("coord999");
        em.persist(coord2User);
        UsuarioDepartamentoEntity udeCoord2 = buildUde(dept, coord2User, Rol.COORDINACION_COMISION_CURRICULAR);
        em.persist(udeCoord2);

        CarreraEntity carrera2 = new CarreraEntity();
        carrera2.setNombre("Ingeniería Eléctrica");
        carrera2.setDuracion("5 años");
        carrera2.setDepartamento(dept);
        carrera2.setComision(udeCoord2);
        em.persist(carrera2);

        CarreraPlanEntity plan2 = new CarreraPlanEntity();
        plan2.setAnio("2020");
        plan2.setVersion(1);
        plan2.setCarrera(carrera2);
        em.persist(plan2);

        MateriaEntity otraMateria = new MateriaEntity();
        otraMateria.setNombre("Electricidad General");
        otraMateria.setCodigo("ELE101");
        otraMateria.setDepartamento(dept);
        em.persist(otraMateria);

        // p1 → plan → carrera → comision = coord001
        ProgramaEntity p1 = buildPrograma(materia, 2025, udeDocente, EstadoPrograma.COMPLETO_POR_PROFESOR);
        em.persist(p1);
        persistBloque(p1, plan);

        // p2 → plan2 → carrera2 → comision = coord999
        ProgramaEntity p2 = buildPrograma(otraMateria, 2025, udeDocente, EstadoPrograma.COMPLETO_POR_PROFESOR);
        em.persist(p2);
        persistBloque(p2, plan2);

        em.flush();

        // When – coord001 consulta
        List<ProgramaEntity> result =
                programaRepository.findProgramasByCoordinadorLegajoAndAnio("coord001", 2025);

        // Then – solo el programa cuya carrera es coordinada por coord001
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(p1.getId());
    }

    @Test
    void findProgramasByCoordinador_givenProgramaWithoutBloques_whenQuery_thenReturnsNothing() {
        // Given – programa sin ProgramaCarreraEntity → el EXISTS retorna falso
        ProgramaEntity p = buildPrograma(materia, 2025, udeDocente, EstadoPrograma.COMPLETO_POR_PROFESOR);
        em.persistAndFlush(p);

        // When / Then
        assertThat(programaRepository.findProgramasByCoordinadorLegajoAndAnio("coord001", 2025)).isEmpty();
    }

    // ═════════════════════════════════════════════════════════════════════
    // TEST 5 – findFirstByMateriaIdAndEstadoActualOrderByAnioDesc()
    // Debe retornar el programa aprobado MÁS RECIENTE cuando hay varios años
    // ═════════════════════════════════════════════════════════════════════

    @Test
    void findFirstByMateriaIdAndEstadoActualOrderByAnioDesc_givenMultipleApprovedYears_whenQuery_thenReturnsMostRecent() {
        // Given – tres programas aprobados: 2022, 2023, 2024
        for (int anio : List.of(2022, 2023, 2024)) {
            ProgramaEntity p = new ProgramaEntity();
            p.setAnio(anio);
            p.setMateria(materia);
            p.setEstadoActual(EstadoPrograma.APROBADO_POR_SECRETARIA);
            em.persist(p);
        }

        // Programa con estado diferente (no debe ser seleccionado)
        ProgramaEntity pBorrador = new ProgramaEntity();
        pBorrador.setAnio(2025);
        pBorrador.setMateria(materia);
        pBorrador.setEstadoActual(EstadoPrograma.COMPLETO_POR_ADMINISTRACION);
        em.persist(pBorrador);

        em.flush();

        // When
        Optional<ProgramaEntity> result = programaRepository
                .findFirstByMateriaIdAndEstadoActualOrderByAnioDesc(
                        materia.getId(), EstadoPrograma.APROBADO_POR_SECRETARIA);

        // Then – devuelve el de 2024 (el más reciente entre los APROBADO_POR_SECRETARIA)
        assertThat(result).isPresent();
        assertThat(result.get().getAnio()).isEqualTo(2024);
        assertThat(result.get().getEstadoActual()).isEqualTo(EstadoPrograma.APROBADO_POR_SECRETARIA);
    }

    @Test
    void findFirstByMateriaIdAndEstadoActualOrderByAnioDesc_givenNoApprovedPrograms_whenQuery_thenReturnsEmpty() {
        // Given – solo un programa pero con estado distinto
        em.persistAndFlush(
                buildPrograma(materia, 2025, udeDocente, EstadoPrograma.COMPLETO_POR_ADMINISTRACION));

        // When / Then
        assertThat(programaRepository.findFirstByMateriaIdAndEstadoActualOrderByAnioDesc(
                materia.getId(), EstadoPrograma.APROBADO_POR_SECRETARIA)).isEmpty();
    }
}

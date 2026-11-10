package com.santimaszong.Sistema_de_Gestion_de_Programas.local;

import com.santimaszong.Sistema_de_Gestion_de_Programas.config.DevLocalConfig;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Commit;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

/** Carga explícita de fixtures persistentes; no es una prueba del circuito real. */
@EnabledIfSystemProperty(named = "silabus.fixture.local", matches = "true")
@ActiveProfiles("dev-local")
@DataJpaTest(showSql = false, properties = {
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.flyway.enabled=false",
        "spring.sql.init.mode=never",
        "spring.main.banner-mode=off",
        "logging.level.root=OFF"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes = LocalManualFixtureTest.Config.class)
class LocalManualFixtureTest {
    private static final String DEPARTAMENTO = "Ciencias e Ingeniería de Computación";
    private static final String MARCA_USUARIO = "Prueba local DCIC";
    private static final String PREFIJO = "LDCIC-";
    private static final ZoneId ZONA = ZoneId.of("America/Argentina/Buenos_Aires");
    private static final List<EstadoPrograma> ESTADOS = List.of(
            EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL,
            EstadoPrograma.RECHAZADO_A_ADMINISTRACION,
            EstadoPrograma.PENDIENTE_DE_DOCENTE,
            EstadoPrograma.RECHAZADO_A_SECRETARIA,
            EstadoPrograma.RECHAZADO_A_DOCENTE,
            EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA,
            EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES,
            EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL,
            EstadoPrograma.APROBADO);

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration
    @EntityScan(basePackageClasses = ProgramaEntity.class)
    @EnableJpaRepositories(basePackageClasses = ProgramaRepository.class)
    @Import(DevLocalConfig.class)
    static class Config {
        @Bean
        PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    }

    @Autowired DepartamentoRepository departamentos;
    @Autowired AreaRepository areas;
    @Autowired MateriaRepository materias;
    @Autowired UserRepository usuarios;
    @Autowired UsuarioDepartamentoRepository vinculos;
    @Autowired CarreraPlanRepository planes;
    @Autowired ProgramaRepository programas;
    @Autowired PasswordEncoder encoder;

    @Test
    @Commit
    void prepararDatosManualesEnLaBaseLocal() {
        // La conexión de DevLocalConfig está fijada a localhost y verifica el destino
        // antes de que Hibernate valide el esquema. No se cargan servicios ni seeder.
        DepartamentoEntity departamento = departamentos.findAll().stream()
                .filter(d -> DEPARTAMENTO.equals(d.getNombre())).findFirst()
                .orElseThrow(() -> new IllegalStateException("Falta el departamento de Computación"));
        UsuarioDepartamentoEntity admin = administradorDelDepartamento(departamento);
        List<CarreraPlanEntity> planesDepartamento = planes.findAll().stream()
                .filter(p -> departamento.getId().equals(p.getCarrera().getDepartamento().getId()))
                .sorted(Comparator.comparing(CarreraPlanEntity::getId)).toList();
        assertThat(planesDepartamento).hasSizeGreaterThanOrEqualTo(2);
        assertThat(planesDepartamento).allSatisfy(p -> {
            assertThat(p.getCarrera().getComision()).isNotNull();
            assertThat(p.getCarrera().getComision().getId()).isEqualTo(admin.getId());
        });

        boolean cambiarPasswords = Boolean.getBoolean("silabus.fixture.passwords");
        String passwordElegida = cambiarPasswords ? System.getenv("SILABUS_FIXTURE_PASSWORD") : null;
        if (cambiarPasswords && (passwordElegida == null || passwordElegida.isBlank())) {
            throw new IllegalStateException("La contraseña debe ingresarse con el lanzador de entrada oculta");
        }
        List<UsuarioDepartamentoEntity> administrativos = new ArrayList<>();
        List<UsuarioDepartamentoEntity> docentes = new ArrayList<>();
        for (int i = 1; i <= 2; i++) {
            administrativos.add(usuario(departamento, "local-adm-0" + i, "Administrativo " + i,
                    Set.of(Rol.ADMINISTRACION), passwordElegida));
            docentes.add(usuario(departamento, "local-doc-0" + i, "Docente " + i,
                    Set.of(Rol.DOCENTE), passwordElegida));
            UsuarioDepartamentoEntity ambos = usuario(departamento, "local-ambos-0" + i, "Ambos roles " + i,
                    Set.of(Rol.ADMINISTRACION, Rol.DOCENTE), passwordElegida);
            administrativos.add(ambos);
            docentes.add(ambos);
        }

        List<AreaEntity> areasFixture = List.of(
                area(departamento, "[Prueba local] Programación y software"),
                area(departamento, "[Prueba local] Sistemas y redes"),
                area(departamento, "[Prueba local] Fundamentos de computación"));
        List<MateriaEntity> bases = new ArrayList<>();
        for (int i = 0; i < areasFixture.size(); i++) {
            bases.add(materia(departamento, areasFixture.get(i), PREFIJO + "BASE-0" + (i + 1),
                    "[Prueba local] Materia disponible para creación " + (i + 1)));
        }

        int anio = LocalDate.now(ZONA).getYear();
        List<ProgramaEntity> programasFixture = new ArrayList<>();
        for (int i = 0; i < ESTADOS.size(); i++) {
            EstadoPrograma destino = ESTADOS.get(i);
            MateriaEntity materia = materia(departamento, areasFixture.get(i % areasFixture.size()),
                    PREFIJO + "P-0" + (i + 1), "[Prueba local] " + nombreEscenario(destino));
            Optional<ProgramaEntity> existente = programas.findAll().stream()
                    .filter(p -> materia.getId().equals(p.getMateria().getId()) && p.getAnio() == anio).findFirst();
            // No reiniciar los programas ya utilizados en pruebas manuales.
            if (existente.isPresent()) {
                programasFixture.add(existente.get());
                continue;
            }
            ProgramaEntity programa = new ProgramaEntity();
            programa.setAnio(anio);
            programa.setMateria(materia);
            UsuarioDepartamentoEntity creador = administrativos.get(i % administrativos.size());
            UsuarioDepartamentoEntity docente = docentes.get(i % docentes.size());
            programa.setDocenteResponsable(docente);
            cargarTextosSinteticos(programa, i + 1);
            for (int j = 0; j < 2; j++) {
                CarreraPlanEntity plan = planesDepartamento.get((i + j) % planesDepartamento.size());
                ProgramaCarreraEntity bloque = new ProgramaCarreraEntity();
                bloque.setPrograma(programa);
                bloque.setCarreraPlan(plan);
                bloque.setUbicacionEnPlan((j + 1) + ".º año, primer cuatrimestre (dato sintético)");
                bloque.setContribucion(j == 0 ? "Contribución sintética: aplicación de contenidos a "
                        + plan.getCarrera().getNombre() + "." : "");
                bloque.getCorrelativasFuertes().add(bases.get(i % bases.size()));
                bloque.getCorrelativasDebiles().add(bases.get((i + 1) % bases.size()));
                programa.getBloqueMultiple().add(bloque);
            }
            prepararHistorialYDecisiones(programa, destino, creador, docente, admin, i);
            programasFixture.add(programas.saveAndFlush(programa));
        }
        assertThat(programasFixture).hasSize(9);
        assertThat(materias.findAll().stream().filter(m -> m.getCodigo().startsWith(PREFIJO))).hasSize(12);
        assertThat(programasFixture).allSatisfy(p -> {
            assertThat(p.getAdministracionResponsable()).isNotNull();
            assertThat(p.getDocenteResponsable()).isNotNull();
            assertThat(p.getHistorialEstados()).isNotEmpty();
            assertThat(p.getBloqueMultiple()).hasSize(2);
        });
        System.out.printf("FIXTURE_LOCAL_DCIC: areas=%d materias=12 programas=%d usuarios=6 contraseñas_actualizadas=%s%n",
                areasFixture.size(), programasFixture.size(), cambiarPasswords);
    }

    private UsuarioDepartamentoEntity administradorDelDepartamento(DepartamentoEntity departamento) {
        List<UsuarioDepartamentoEntity> candidatos = vinculos.findByDepartamentoId(departamento.getId()).stream()
                .filter(v -> v.isActivo() && v.getUsuario().isEnabled() && v.hasRole(Rol.SYSTEM_ADMIN)).toList();
        assertThat(candidatos).hasSize(1);
        UsuarioDepartamentoEntity admin = candidatos.getFirst();
        assertThat(admin.getRoles()).contains(Rol.SECRETARIA, Rol.DIRECCION_ADMINISTRATIVA,
                Rol.COORDINACION_COMISION_CURRICULAR);
        return admin;
    }

    private UsuarioDepartamentoEntity usuario(DepartamentoEntity departamento, String legajo, String nombre,
                                              Set<Rol> roles, String nuevaPassword) {
        UserEntity user = usuarios.findByLegajo(legajo).orElse(null);
        if (user == null) {
            user = new UserEntity();
            user.setLegajo(legajo);
            user.setNombre(nombre);
            user.setApellido(MARCA_USUARIO);
            user.setEnabled(true);
            user.setAdmin(false);
            // Aleatoria por cuenta, nunca escrita en logs, documentación o archivos.
            user.setPassword(encoder.encode(UUID.randomUUID().toString() + UUID.randomUUID()));
            usuarios.saveAndFlush(user);
        } else if (!MARCA_USUARIO.equals(user.getApellido())) {
            throw new IllegalStateException("Hay una cuenta ajena que coincide con un identificador reservado del fixture");
        }
        if (nuevaPassword != null) user.setPassword(encoder.encode(nuevaPassword));
        UsuarioDepartamentoEntity vinculo = vinculos.findByUsuarioIdAndDepartamentoId(user.getId(), departamento.getId()).orElse(null);
        if (vinculo == null) {
            vinculo = new UsuarioDepartamentoEntity();
            vinculo.setUsuario(user);
            vinculo.setDepartamento(departamento);
            vinculo.setEmail(legajo + "@example.invalid");
            vinculo.setActivo(true);
            vinculo.setFechaAlta(LocalDateTime.now(ZONA));
            vinculo.setRoles(new HashSet<>(roles));
            vinculos.saveAndFlush(vinculo);
        }
        // No conceder cargos dinámicos ni sobrescribir cambios de roles ya realizados.
        assertThat(vinculo.getRoles()).containsAll(roles);
        return vinculo;
    }

    private AreaEntity area(DepartamentoEntity departamento, String nombre) {
        AreaEntity existente = areas.findAll().stream()
                .filter(a -> departamento.getId().equals(a.getDepartamento().getId()) && nombre.equals(a.getNombre()))
                .findFirst().orElse(null);
        if (existente != null) return existente;
        AreaEntity nueva = new AreaEntity();
        nueva.setNombre(nombre);
        nueva.setDepartamento(departamento);
        return areas.saveAndFlush(nueva);
    }

    private MateriaEntity materia(DepartamentoEntity departamento, AreaEntity area, String codigo, String nombre) {
        MateriaEntity existente = materias.findAll().stream().filter(m -> codigo.equals(m.getCodigo())).findFirst().orElse(null);
        if (existente != null) {
            assertThat(existente.getDepartamento().getId()).isEqualTo(departamento.getId());
            assertThat(existente.getNombre()).startsWith("[Prueba local]");
            return existente;
        }
        MateriaEntity nueva = new MateriaEntity();
        nueva.setCodigo(codigo);
        nueva.setNombre(nombre);
        nueva.setDepartamento(departamento);
        nueva.setArea(area);
        return materias.saveAndFlush(nueva);
    }

    private void cargarTextosSinteticos(ProgramaEntity p, int numero) {
        p.setCantidadSemanas(16);
        p.setCargaHorariaSemanal(4);
        p.setCargaHorariaTotal(64);
        p.setCargaHorariaPractica(2);
        p.setCreditos(6);
        p.setContenidosMinimos("Datos sintéticos, escenario " + numero + ": abstracción, algoritmos, estructuras de datos, "
                + "resolución de problemas y evaluación de soluciones informáticas.");
        p.setFundamentacion("Programa de prueba local. Permite revisar la relación entre fundamentos de computación "
                + "y desarrollo de soluciones. No constituye documentación académica institucional.");
        p.setObjetivos("Analizar problemas, construir soluciones, justificar decisiones y comunicar resultados. "
                + "Identificar límites de las soluciones y trabajar de forma colaborativa.");
        p.setProgramaAnalitico("Unidad 1: modelado y abstracción. Unidad 2: algoritmos y estructuras. "
                + "Unidad 3: implementación y pruebas. Unidad 4: proyecto integrador y discusión de resultados.");
        p.setMetodologia("Clases teórico-prácticas, laboratorios guiados, resolución colaborativa de problemas "
                + "y revisión de entregas. Actividades de aprendizaje con casos sintéticos.");
        p.setModalidadEvaluacion("Dos evaluaciones parciales y un proyecto integrador con defensa. "
                + "Criterios y condiciones sintéticos para revisar la presentación del formulario.");
        p.setBibliografia("Material didáctico ficticio de la asignatura. Guía local de algoritmos y prácticas de programación. "
                + "Referencias de prueba, sin llamadas a servicios de IA.");
    }

    private void prepararHistorialYDecisiones(ProgramaEntity p, EstadoPrograma destino,
            UsuarioDepartamentoEntity creador, UsuarioDepartamentoEntity docente,
            UsuarioDepartamentoEntity admin, int numero) {
        LocalDateTime inicio = LocalDateTime.now(ZONA).minusDays(12L + numero);
        estado(p, EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL, creador, Rol.ADMINISTRACION, null,
                "Creación sintética para pruebas manuales locales.", inicio);
        if (destino == EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL) return;
        if (destino == EstadoPrograma.RECHAZADO_A_ADMINISTRACION) {
            estado(p, destino, admin, Rol.SECRETARIA, "Revisar la carga semanal y los créditos del escenario de prueba.",
                    null, inicio.plusHours(1));
            return;
        }
        estado(p, EstadoPrograma.PENDIENTE_DE_DOCENTE, admin, Rol.SECRETARIA, null, null, inicio.plusHours(1));
        if (destino == EstadoPrograma.PENDIENTE_DE_DOCENTE) return;
        if (destino == EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA) {
            estado(p, destino, docente, Rol.DOCENTE, null,
                    "Fixture preparado directamente: pendiente de Área sin coordinador asignado. "
                            + "No representa un envío normal; asignar manualmente un coordinador para actuar en esta etapa.",
                    inicio.plusHours(2));
            return;
        }
        if (destino == EstadoPrograma.RECHAZADO_A_SECRETARIA) {
            estado(p, destino, docente, Rol.DOCENTE,
                    "Completar la ubicación de la asignatura en los planes de estudio del caso sintético.",
                    "Devolución sintética para pruebas locales.", inicio.plusHours(2));
            return;
        }
        estado(p, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, docente, Rol.DOCENTE, null,
                "Revisión de Área omitida: área sin coordinador. Datos sintéticos de prueba.", inicio.plusHours(2));
        p.setRondaRevision(1);
        for (int i = 0; i < p.getBloqueMultiple().size(); i++) {
            ProgramaCarreraEntity bloque = p.getBloqueMultiple().get(i);
            CarreraPlanEntity plan = bloque.getCarreraPlan();
            DecisionComisionEntity decision = new DecisionComisionEntity();
            decision.setPrograma(p);
            decision.setProgramaCarrera(bloque);
            decision.setRonda(1);
            decision.setCarreraPlanId(plan.getId());
            decision.setCarreraNombre(plan.getCarrera().getNombre());
            decision.setPlanAnio(plan.getAnio());
            decision.setPlanVersion(plan.getVersion());
            boolean rechazo = destino == EstadoPrograma.RECHAZADO_A_DOCENTE;
            if (rechazo) {
                decision.setResultado(i == 0 ? ResultadoDecisionComision.RECHAZADA : ResultadoDecisionComision.CANCELADA);
                decision.setFechaDecision(inicio.plusHours(3));
                if (i == 0) {
                    decision.setActor(admin);
                    decision.setJustificacion("Revisar los objetivos y el sistema de evaluación del caso sintético.");
                    decision.setDestinoRechazo(Rol.DOCENTE);
                }
            } else if (destino == EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL || destino == EstadoPrograma.APROBADO || i == 0) {
                decision.setResultado(ResultadoDecisionComision.APROBADA);
                decision.setActor(admin);
                decision.setFechaDecision(inicio.plusHours(3).plusMinutes(i));
            }
            p.getDecisionesComision().add(decision);
        }
        if (destino == EstadoPrograma.RECHAZADO_A_DOCENTE) {
            estado(p, destino, admin, Rol.COORDINACION_COMISION_CURRICULAR,
                    "Revisar los objetivos y el sistema de evaluación del caso sintético.", null, inicio.plusHours(3));
        } else if (destino == EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL || destino == EstadoPrograma.APROBADO) {
            estado(p, EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL, admin, Rol.COORDINACION_COMISION_CURRICULAR,
                    null, "Aceptación sintética de todos los bloques de la ronda.", inicio.plusHours(4));
            if (destino == EstadoPrograma.APROBADO)
                estado(p, destino, admin, Rol.SECRETARIA, null, null, inicio.plusHours(5));
        }
    }

    private void estado(ProgramaEntity p, EstadoPrograma estado, UsuarioDepartamentoEntity actor, Rol rol,
                        String justificacion, String observacion, LocalDateTime fecha) {
        p.registrarNuevoEstado(estado, actor, rol, justificacion, observacion);
        p.getHistorialEstados().getLast().setFecha(fecha);
    }

    private String nombreEscenario(EstadoPrograma estado) {
        return switch (estado) {
            case PENDIENTE_DE_SECRETARIA_INICIAL -> "Pendiente de Secretaría inicial";
            case RECHAZADO_A_ADMINISTRACION -> "Corrección administrativa";
            case PENDIENTE_DE_DOCENTE -> "Carga docente";
            case RECHAZADO_A_SECRETARIA -> "Corrección de Secretaría inicial";
            case RECHAZADO_A_DOCENTE -> "Corrección docente";
            case PENDIENTE_DE_COORDINACION_AREA -> "Revisión de Área preparada manualmente";
            case PENDIENTE_DE_COMISIONES_CURRICULARES -> "Revisión de comisiones curriculares";
            case PENDIENTE_DE_SECRETARIA_FINAL -> "Revisión de Secretaría final";
            case APROBADO -> "Programa aprobado";
            default -> throw new IllegalArgumentException("Estado fuera de los nueve escenarios actuales");
        };
    }
}

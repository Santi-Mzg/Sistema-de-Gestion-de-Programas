package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.utils;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaCarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DecisionComisionEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.ResultadoDecisionComision;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import java.util.ArrayList;
import java.util.List;

public class ProgramaSpecifications {

    public static Specification<ProgramaEntity> docenteResponsable(Long actorId) {
        return (root, query, cb) -> cb.equal(root.get("docenteResponsable").get("id"), actorId);
    }

    /** Incluye programas de otros departamentos vinculados a carreras del vínculo activo. */
    public static Specification<ProgramaEntity> carrerasCoordinadas(Long actorId) {
        return (root, query, cb) -> {
            Subquery<Long> sq = query.subquery(Long.class);
            Root<ProgramaCarreraEntity> bloque = sq.from(ProgramaCarreraEntity.class);
            sq.select(bloque.get("id")).where(
                    cb.equal(bloque.get("programa"), root),
                    cb.equal(bloque.get("carreraPlan").get("carrera").get("comision").get("id"), actorId));
            return cb.exists(sq);
        };
    }

    public static Specification<ProgramaEntity> areaCoordinada(Long actorId) {
        return (root, query, cb) -> cb.equal(root.get("materia").get("area").get("coordinador").get("id"), actorId);
    }

    public static Specification<ProgramaEntity> pendienteComision(Long actorId) {
        return (root, query, cb) -> {
            Subquery<Long> sq = query.subquery(Long.class);
            Root<DecisionComisionEntity> decision = sq.from(DecisionComisionEntity.class);
            sq.select(decision.get("id")).where(cb.equal(decision.get("programa"), root),
                    cb.equal(decision.get("ronda"), root.get("rondaRevision")),
                    cb.equal(decision.get("programaCarrera").get("carreraPlan").get("carrera").get("comision").get("id"), actorId),
                    cb.equal(decision.get("resultado"), ResultadoDecisionComision.PENDIENTE),
                    cb.equal(estadoCanonico(root, cb), EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES.name()));
            return cb.exists(sq);
        };
    }

    public static Specification<ProgramaEntity> anio(Integer anio) {
        return (root, query, cb) ->
                cb.equal(root.get("anio"), anio);
    }

    public static Specification<ProgramaEntity> departamento(Long deptId) {
        return (root, query, cb) ->
                cb.equal(
                        root.get("materia")
                                .get("departamento")
                                .get("id"),
                        deptId
                );
    }

    public static Specification<ProgramaEntity> docente(String legajo) {
        return (root, query, cb) ->
                cb.equal(
                        root.get("docenteResponsable")
                                .get("usuario")
                                .get("legajo"),
                        legajo
                );
    }

    public static Specification<ProgramaEntity> coordinador(
            String legajo,
            String nombreCarrera
    ) {
        return (root, query, cb) -> {

            Subquery<Long> subquery = query.subquery(Long.class);

            Root<ProgramaCarreraEntity> pc =

                    subquery.from(ProgramaCarreraEntity.class);

            List<Predicate> predicates = new ArrayList<>();

            // pc pertenece al programa que estamos evaluando
            predicates.add(
                    cb.equal(
                            pc.get("programa"),
                            root
                    )
            );

            // La carrera pertenece a la comisión del coordinador logueado
            predicates.add(
                    cb.equal(
                            pc.get("carreraPlan")
                                    .get("carrera")
                                    .get("comision")
                                    .get("usuario")
                                    .get("legajo"),
                            legajo
                    )
            );

            // Filtro opcional por nombre de carrera
            if (nombreCarrera != null && !nombreCarrera.isBlank()) {
                predicates.add(
                        cb.equal(
                                cb.lower(
                                        pc.get("carreraPlan")
                                                .get("carrera")
                                                .get("nombre")
                                ),
                                nombreCarrera.trim().toLowerCase()
                        )
                );
            }

            subquery.select(pc.get("id"))
                    .where(predicates.toArray(new Predicate[0]));

            return cb.exists(subquery);
        };
    }

    public static Specification<ProgramaEntity> estado(
            EstadoPrograma estado
    ) {
        return (root, query, cb) -> {
            if (estado == null) {
                return cb.conjunction();
            }

            return cb.equal(
                    estadoCanonico(root, cb),
                    estado.name()
            );
        };
    }

    public static Specification<ProgramaEntity> estadoIn(
            List<EstadoPrograma> estados
    ) {
        return (root, query, cb) -> {
            if (estados == null || estados.isEmpty()) {
                return cb.conjunction();
            }

            return estadoCanonico(root, cb).in(estados.stream().map(EstadoPrograma::name).toList());
        };
    }

    /** Incluye registros históricos sin modificar los valores almacenados. */
    private static jakarta.persistence.criteria.Expression<String> estadoCanonico(
            Root<ProgramaEntity> root, jakarta.persistence.criteria.CriteriaBuilder cb) {
        var estado = root.get("estadoActual").as(String.class);
        return cb.<String, String>selectCase(estado)
                .when("COMPLETO_POR_ADMINISTRACION", EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL.name())
                .when("COMPLETO_POR_SECRETARIA", EstadoPrograma.PENDIENTE_DE_DOCENTE.name())
                .when("COMPLETO_POR_DOCENTE", EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES.name())
                .when("COMPLETO_POR_PROFESOR", EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES.name())
                .when("APROBADO_POR_COMISION", EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL.name())
                .when("APROBADO_POR_SECRETARIA", EstadoPrograma.APROBADO.name())
                .when("RECHAZADO_A_PROFESOR", EstadoPrograma.RECHAZADO_A_DOCENTE.name())
                .otherwise(estado);
    }

    public static Specification<ProgramaEntity> search(
            String search
    ) {
        return (root, query, cb) -> {

            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }

            String term = "%" + search.trim().toLowerCase() + "%";

            return cb.or(
                    cb.like(
                            cb.lower(
                                    root.get("materia").get("nombre")
                            ),
                            term
                    ),
                    cb.like(
                            cb.lower(
                                    root.get("materia").get("codigo")
                            ),
                            term
                    ),
                    cb.like(
                            cb.lower(
                                    root.get("docenteResponsable")
                                            .get("usuario")
                                            .get("nombre")
                            ),
                            term
                    ),
                    cb.like(
                            cb.lower(
                                    root.get("docenteResponsable")
                                            .get("usuario")
                                            .get("apellido")
                            ),
                            term
                    ),
                    cb.like(
                            cb.lower(
                                    root.get("docenteResponsable")
                                            .get("usuario")
                                            .get("legajo")
                            ),
                            term
                    ),
                    cb.like(
                            cb.lower(
                                    root.get("materia")
                                            .get("departamento")
                                            .get("nombre")
                            ),
                            term
                    )
            );
        };
    }
}

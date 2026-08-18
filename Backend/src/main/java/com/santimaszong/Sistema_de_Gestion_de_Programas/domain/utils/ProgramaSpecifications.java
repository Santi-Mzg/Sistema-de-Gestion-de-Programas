package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.utils;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaCarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import java.util.ArrayList;
import java.util.List;

public class ProgramaSpecifications {

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
                        root.get("profesorResponsable")
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
                    root.get("estadoActual"),
                    estado
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

            return root.get("estadoActual").in(estados);
        };
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
                                    root.get("profesorResponsable")
                                            .get("usuario")
                                            .get("nombre")
                            ),
                            term
                    ),
                    cb.like(
                            cb.lower(
                                    root.get("profesorResponsable")
                                            .get("usuario")
                                            .get("apellido")
                            ),
                            term
                    ),
                    cb.like(
                            cb.lower(
                                    root.get("profesorResponsable")
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

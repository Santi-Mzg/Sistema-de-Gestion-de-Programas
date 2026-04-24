package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import org.springframework.data.jpa.repository.JpaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramaRepository extends JpaRepository<ProgramaEntity, Long> {
    boolean existsByMateriaIdAndAnio(Long materiaId, Integer anio);

    Optional<ProgramaEntity> findByMateriaIdAndAnio(Long materiaId, Integer anio);

    void deleteByMateriaIdAndAnio(Long materiaId, Integer anio);


    Optional<ProgramaEntity> findFirstByMateriaIdAndEstadoActualOrderByAnioDesc(
            Long materiaId,
            EstadoPrograma estadoActual
    );

    @Query("""
        SELECT DISTINCT p FROM ProgramaEntity p
        JOIN FETCH p.materia m
        JOIN FETCH m.departamento
        JOIN FETCH m.area
        LEFT JOIN FETCH p.profesorResponsable pr
        LEFT JOIN FETCH pr.usuario
        LEFT JOIN FETCH p.bloqueMultiple pc
        LEFT JOIN FETCH pc.decisionComision
        LEFT JOIN FETCH pc.carreraPlan cp
        LEFT JOIN FETCH cp.carrera
        LEFT JOIN FETCH pc.correlativasFuertes
        LEFT JOIN FETCH pc.correlativasDebiles
        LEFT JOIN FETCH p.historialEstados
        WHERE m.departamento.id = :departamentoId
        AND p.anio = :anio
    """)
    List<ProgramaEntity> findByMateriaDepartamentoIdAndAnio(
            @Param("departamentoId") Long departamentoId,
            @Param("anio") Integer anio
    );

    @Query("""
    SELECT DISTINCT p FROM ProgramaEntity p
    JOIN FETCH p.materia m
    JOIN FETCH m.departamento
    JOIN FETCH m.area
    LEFT JOIN FETCH p.profesorResponsable pr
    LEFT JOIN FETCH pr.usuario
    LEFT JOIN FETCH p.bloqueMultiple pc
    LEFT JOIN FETCH pc.decisionComision
    LEFT JOIN FETCH pc.carreraPlan cp
    LEFT JOIN FETCH cp.carrera
    LEFT JOIN FETCH pc.correlativasFuertes
    LEFT JOIN FETCH pc.correlativasDebiles
    LEFT JOIN FETCH p.historialEstados
    WHERE pr.usuario.legajo = :legajo
    AND m.departamento.id = :departamentoId
    AND p.anio = :anio
""")
    List<ProgramaEntity> findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoIdAndAnio(
            @Param("legajo") String legajo,
            @Param("departamentoId") Long departamentoId,
            @Param("anio") Integer anio
    );


//    @Query("""
//        SELECT DISTINCT p FROM ProgramaEntity p
//        JOIN ProgramaCarreraEntity pc ON pc.programa = p
//        JOIN pc.carreraPlan cp
//        JOIN cp.carrera c
//        JOIN c.comision com
//        JOIN com.usuario u
//        WHERE p.anio = :anio
//        AND u.legajo = :legajo
//    """)
    @Query("""
        SELECT p FROM ProgramaEntity p
            WHERE p.anio = :anio
            AND EXISTS (
                SELECT 1 FROM ProgramaCarreraEntity pc
                WHERE pc.programa = p
                AND pc.carreraPlan.carrera.comision.usuario.legajo = :legajo
            )
    """)
    List<ProgramaEntity> findProgramasByCoordinadorLegajoAndAnio(@Param("legajo") String legajo, @Param("anio") Integer anio);

//    @Query("""
//        SELECT DISTINCT p FROM ProgramaEntity p
//        JOIN p.decisionComisiones d
//        WHERE d.comision.usuario.legajo = :legajo
//        AND p.anio = :anio
//        AND d.aprobado = false
//        AND p.estadoActual IN (
//            INCOMPLETO_POR_ADMINISTRACION,
//            RECHAZADO_A_ADMINISTRACION
//        )
//    """)
//    List<ProgramaEntity> findProgramasPendientesAdministrativo(@Param("legajo") String legajo, @Param("anio") Integer anio);
//
//    @Query("""
//        SELECT DISTINCT p FROM ProgramaEntity p
//        JOIN p.decisionComisiones d
//        WHERE d.comision.usuario.legajo = :legajo
//        AND p.anio = :anio
//        AND d.aprobado = false
//        AND p.estadoActual IN (
//            COMPLETO_POR_ADMINISTRACION,
//            INCOMPLETO_POR_PROFESOR,
//            RECHAZADO_A_PROFESOR
//        )
//    """)
//    List<ProgramaEntity> findProgramasPendientesDocente(@Param("legajo") String legajo, @Param("anio") Integer anio);


//    @Query("""
//        SELECT DISTINCT p FROM ProgramaEntity p
//        JOIN p.decisionComisiones d
//        WHERE d.comision.usuario.legajo = :legajo
//        AND p.anio = :anio
//        AND d.aprobado = false
//        AND p.estadoActual = 'COMPLETO_POR_PROFESOR'
//    """)

    @Query("""            
        SELECT p FROM ProgramaEntity p
            WHERE p.anio = :anio
            AND p.estadoActual = :estado
            AND EXISTS (
                SELECT 1 FROM ProgramaCarreraEntity pc
                WHERE pc.programa = p
                AND pc.carreraPlan.carrera.comision.usuario.legajo = :legajo
                AND pc.decisionComision.aprobado = false
            )
    """)
    List<ProgramaEntity> findProgramasPendientesCoordinador(
            @Param("legajo") String legajo,
            @Param("anio") Integer anio,
            @Param("estado") EstadoPrograma estado
    );

//    @Query("""
//        SELECT DISTINCT p FROM ProgramaEntity p
//        JOIN p.materia.departamento d
//        WHERE d.comision.usuario.legajo = :legajo
//        AND p.anio = :anio
//        AND p.estadoActual = 'APROBADO_POR_COMISION'
//    """)
//    List<ProgramaEntity> findProgramasPendientesSecretaria(@Param("legajo") String legajo, @Param("anio") Integer anio);

}

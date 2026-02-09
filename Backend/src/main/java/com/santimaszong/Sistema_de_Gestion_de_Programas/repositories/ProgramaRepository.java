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

    List<ProgramaEntity> findByMateriaDepartamentoIdAndAnio(Long departamentoId, Integer anio);


    List<ProgramaEntity> findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoIdAndAnio(
            String legajo,
            Long departamentoId,
            Integer anio
    );

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

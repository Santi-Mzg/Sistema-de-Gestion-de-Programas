package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DecisionComisionEntity;

@Repository
public interface DecisionComisionRepository extends JpaRepository<DecisionComisionEntity, Long> {

    @Query("""
        SELECT d FROM DecisionComisionEntity d
        WHERE d.programa.id = :programaId
        AND d.ronda = d.programa.rondaRevision
        AND d.programaCarrera.carreraPlan.id = :carreraId
        AND d.programaCarrera.carreraPlan.carrera.comision.id = :comisionId
    """)
    Optional<DecisionComisionEntity> findByProgramaIdAndCarreraIdAndComisionId(
            @Param("programaId") Long programaId,
            @Param("carreraId") Long carreraId,
            @Param("comisionId") Long comisionId
    );

    @Query("""
        SELECT count(d) FROM DecisionComisionEntity d
        WHERE d.programa.id = :programaId AND d.ronda = d.programa.rondaRevision
        AND d.resultado = com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.ResultadoDecisionComision.PENDIENTE
    """)
    long countPendientesRondaActual(@Param("programaId") Long programaId);

    /** Cuenta bloques pendientes del vínculo activo, no programas distintos. */
    @Query("""
        SELECT count(d) FROM DecisionComisionEntity d
        WHERE d.programa.anio = :anio
        AND d.ronda = d.programa.rondaRevision
        AND d.resultado = com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.ResultadoDecisionComision.PENDIENTE
        AND d.programaCarrera.carreraPlan.carrera.comision.id = :comisionId
        AND cast(d.programa.estadoActual as string) IN (
            'PENDIENTE_DE_COMISIONES_CURRICULARES'
        )
    """)
    long countRevisionesPendientes(@Param("comisionId") Long comisionId, @Param("anio") int anio);

}

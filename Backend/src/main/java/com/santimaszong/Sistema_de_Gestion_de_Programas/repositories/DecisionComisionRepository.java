package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DecisionComisionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface DecisionComisionRepository extends JpaRepository<DecisionComisionEntity, Long> {

    @Query("""
        SELECT d FROM DecisionComisionEntity d
        WHERE d.programaCarrera.programa.id = :programaId
        AND d.programaCarrera.carreraPlan.id = :carreraId
        AND d.programaCarrera.carreraPlan.carrera.comision.id = :comisionId
    """)
    Optional<DecisionComisionEntity> findByProgramaIdAndCarreraIdAndComisionId(
            @Param("programaId") Long programaId,
            @Param("carreraId") Long carreraId,
            @Param("comisionId") Long comisionId
    );

    long countByProgramaCarreraProgramaIdAndAprobadoFalse(Long programaId);

}

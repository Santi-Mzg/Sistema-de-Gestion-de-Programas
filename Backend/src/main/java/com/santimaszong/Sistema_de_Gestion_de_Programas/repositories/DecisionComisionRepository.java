package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DecisionComisionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DecisionComisionRepository extends JpaRepository<DecisionComisionEntity, Long> {


    Optional<DecisionComisionEntity> findByProgramaIdAndComisionUsuarioId(Long programaId, Long userId);

    long countByProgramaIdAndAprobadoFalse(Long programaId);

    void deleteByProgramaId(Long programaId);
}

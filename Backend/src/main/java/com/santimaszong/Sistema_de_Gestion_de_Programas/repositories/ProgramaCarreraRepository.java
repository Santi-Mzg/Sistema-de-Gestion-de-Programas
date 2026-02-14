package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaCarreraEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProgramaCarreraRepository extends JpaRepository<ProgramaCarreraEntity, Long> {

    Optional<ProgramaCarreraEntity> findByProgramaIdAndCarreraPlanId(
            @Param("programaId") Long programaId,
            @Param("carreraId") Long carreraId
    );

}

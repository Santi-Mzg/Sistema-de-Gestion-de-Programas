package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaDraftEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface ProgramaDraftRepository extends JpaRepository<ProgramaDraftEntity, Long> {
    Optional<ProgramaDraftEntity> findByUsuarioIdAndMateriaIdAndAnioAndRolAndProgramaIdAndPlanId(
            Long usuarioId, Long materiaId, Integer anio,
            com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol rol, Long programaId, Long planId);
    void deleteByUsuarioIdAndMateriaIdAndAnioAndRolAndProgramaIdAndPlanId(
            Long usuarioId, Long materiaId, Integer anio,
            com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol rol, Long programaId, Long planId);

    Optional<ProgramaDraftEntity> findByUsuarioIdAndMateriaId(
            Long usuarioId,
            Long materiaId
    );

    void deleteByUsuarioIdAndMateriaId(
            Long usuarioId,
            Long materiaId
    );
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import org.springframework.data.jpa.repository.JpaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramaRepository extends JpaRepository<ProgramaEntity, Long> {
    Optional<ProgramaEntity> findFirstByMateriaIdAndEstadoActualOrderByAnioDesc(
            Long materiaId,
            EstadoPrograma estadoActual
    );

    List<ProgramaEntity> findByMateriaDepartamentoId(Long departamentoId);

    List<ProgramaEntity> findByBloqueMultipleCarreraId(Long carreraId);

    List<ProgramaEntity> findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoId(
            String legajo,
            Long departamentoId
    );

}

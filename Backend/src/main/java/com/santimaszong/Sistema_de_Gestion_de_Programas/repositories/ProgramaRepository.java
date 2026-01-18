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

    List<ProgramaEntity> findByMateriaDepartamentoId(Long departamentoId);


    List<ProgramaEntity> findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoId(
            String legajo,
            Long departamentoId
    );

    @Query("""
        SELECT DISTINCT p FROM ProgramaEntity p
        JOIN p.bloqueMultiple pc
        JOIN pc.carreraPlan cp
        JOIN cp.carrera c
        JOIN c.comision ud
        JOIN ud.usuario u
        WHERE u.legajo = :legajo
    """)
    List<ProgramaEntity> findProgramasByCoordinadorLegajo(@Param("legajo") String legajo);

}

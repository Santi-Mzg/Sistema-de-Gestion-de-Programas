package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;

@Repository
public interface ProgramaRepository extends JpaRepository<ProgramaEntity, Long>, JpaSpecificationExecutor<ProgramaEntity> {

    @EntityGraph(attributePaths = {
            "materia.departamento",
            "materia.area",
            "profesorResponsable.usuario",
            "bloqueMultiple.carreraPlan.carrera"
    })
    Optional<ProgramaEntity> findWithAllDetailsById(Long id);

    boolean existsByMateriaIdAndAnio(Long materiaId, Integer anio);

    @EntityGraph(attributePaths = {
            "materia.departamento",
            "materia.area",
            "profesorResponsable.usuario",
            "bloqueMultiple.carreraPlan.carrera"
    })
    Optional<ProgramaEntity> findByMateriaIdAndAnio(Long materiaId, Integer anio);

    void deleteByMateriaIdAndAnio(Long materiaId, Integer anio);

    @EntityGraph(attributePaths = {
            "materia.departamento",
            "materia.area",
            "profesorResponsable.usuario",
            "bloqueMultiple.carreraPlan.carrera"
    })
    Optional<ProgramaEntity> findFirstByMateriaIdAndEstadoActualOrderByAnioDesc(
            Long materiaId,
            EstadoPrograma estadoActual
    );
}

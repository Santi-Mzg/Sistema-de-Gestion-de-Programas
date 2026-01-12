package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartamentoRepository extends JpaRepository<DepartamentoEntity, Long> {

    @EntityGraph(attributePaths = {"areas"})
    Optional<DepartamentoEntity> findWithAreasById(Long id);

    @EntityGraph(attributePaths = {"carreras"})
    Optional<DepartamentoEntity> findWithCarrerasById(Long id);

    @EntityGraph(attributePaths = {"materias"})
    Optional<DepartamentoEntity> findWithMateriasById(Long id);
}

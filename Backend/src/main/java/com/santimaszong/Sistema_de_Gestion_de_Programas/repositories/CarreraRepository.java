package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarreraRepository extends JpaRepository<CarreraEntity, Long> {


    @Query("""
        SELECT c
        FROM CarreraEntity c
        WHERE c.departamento.id = :deptId
        AND (
            :search = ''
            OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
        )
    """)
    Page<CarreraEntity> findAllByDepartamentoId(
            @Param("deptId") Long deptId,
            @Param("search") String search,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"planes"})
    Optional<CarreraEntity> findWithPlanesById(Long id);

    long countByDepartamentoId(Long departamentoId);

}

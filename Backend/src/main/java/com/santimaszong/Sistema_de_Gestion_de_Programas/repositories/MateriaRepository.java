package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MateriaRepository extends JpaRepository<MateriaEntity, Long> {
    @Query("SELECT m FROM MateriaEntity m WHERE m.id IN :ids")
    List<MateriaEntity> findAllById(@Param("ids") List<Long> ids);

    long countByDepartamentoId(Long departamentoId);

    @Query("""
        SELECT m
        FROM MateriaEntity m
        WHERE m.departamento.id = :deptId
        AND (
            :search = ''
            OR LOWER(m.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(m.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
        )
    """)
    Page<MateriaEntity> findAllByDepartamentoId(
            @Param("deptId") Long deptId,
            @Param("search") String search,
            Pageable pageable
    );
}

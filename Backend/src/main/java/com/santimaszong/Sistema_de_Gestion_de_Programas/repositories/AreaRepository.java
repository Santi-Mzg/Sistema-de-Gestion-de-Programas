package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.AreaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface AreaRepository extends JpaRepository<AreaEntity, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select a from AreaEntity a where a.id = :id")
    java.util.Optional<AreaEntity> findForUpdateById(@Param("id") Long id);

    java.util.List<AreaEntity> findByCoordinadorId(Long coordinadorId);
    long countByCoordinadorId(Long coordinadorId);

    Page<AreaEntity> findByDepartamentoIdAndCoordinadorUsuarioLegajoAndNombreContainingIgnoreCase(
            Long departamentoId, String legajo, String nombre, Pageable pageable);

    long countByDepartamentoId(Long departamentoId);

    @Query("""
        SELECT a
        FROM AreaEntity a
        WHERE a.departamento.id = :deptId
        AND (
            :search = ''
            OR LOWER(a.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
        )
    """)
    Page<AreaEntity> findAllByDepartamentoId(
            @Param("deptId") Long deptId,
            @Param("search") String search,
            Pageable pageable
    );
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioDepartamentoRepository extends JpaRepository<UsuarioDepartamentoEntity, Long> {
    List<UsuarioDepartamentoEntity> findByDepartamentoId(Long departamentoId);
    Optional<UsuarioDepartamentoEntity> findByUsuarioIdAndDepartamentoId(Long usuarioId, Long departamentoId);
    Optional<UsuarioDepartamentoEntity> findByUsuarioLegajoAndDepartamentoId(String legajo, Long departamentoId);

    @Query("""
        select distinct ude from UsuarioDepartamentoEntity ude
        join fetch ude.usuario u
        join fetch ude.roles
        where ude.departamento.id = :deptId
        """)
    List<UsuarioDepartamentoEntity> findFullByDepartamentoId(@Param("deptId") Long deptId);

    long countByDepartamentoId(Long departamentoId);

    @Query("""
        SELECT COUNT(DISTINCT ude)
        FROM UsuarioDepartamentoEntity ude
        JOIN ude.roles r
        WHERE ude.departamento.id = :deptId
        AND r = :rol
    """)
    long countByDepartamentoIdAndRol(
            @Param("deptId") Long deptId,
            @Param("rol") Rol rol
    );
}

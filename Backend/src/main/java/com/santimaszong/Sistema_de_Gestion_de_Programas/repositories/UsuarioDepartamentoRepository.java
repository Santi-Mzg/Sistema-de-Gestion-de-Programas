package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
    List<UsuarioDepartamentoEntity> findFullByDepartamentoId(Long deptId);
}

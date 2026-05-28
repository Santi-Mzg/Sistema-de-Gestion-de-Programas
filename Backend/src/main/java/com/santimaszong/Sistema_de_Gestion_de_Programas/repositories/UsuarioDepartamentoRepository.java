package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
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


//    @Query("""
//        SELECT DISTINCT ude FROM UsuarioDepartamentoEntity ude
//        JOIN FETCH ude.usuario u
//        JOIN FETCH ude.departamento d
//        LEFT JOIN FETCH p.profesorResponsable pr
//        LEFT JOIN FETCH pr.usuario
//        LEFT JOIN FETCH p.bloqueMultiple pc
//        LEFT JOIN FETCH pc.decisionComision
//        LEFT JOIN FETCH pc.carreraPlan cp
//        LEFT JOIN FETCH cp.carrera
//        LEFT JOIN FETCH pc.correlativasFuertes
//        LEFT JOIN FETCH pc.correlativasDebiles
//        LEFT JOIN FETCH p.historialEstados
//        WHERE d.id = :deptId
//    """)
    @Query("""
        select distinct ude from UsuarioDepartamentoEntity ude
        join fetch ude.usuario u
        join fetch ude.roles
        where ude.departamento.id = :deptId
        """)
    List<UsuarioDepartamentoEntity> findFullByDepartamentoId(@Param("deptId") Long deptId);
}

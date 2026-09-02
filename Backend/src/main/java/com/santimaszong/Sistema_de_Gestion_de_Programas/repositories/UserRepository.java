package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    @Query("""
        SELECT DISTINCT u FROM UserEntity u
        LEFT JOIN FETCH u.departamentos ud
        LEFT JOIN FETCH ud.departamento d
        LEFT JOIN FETCH ud.roles r
        LEFT JOIN FETCH ud.carrerasComoComision ccc
        WHERE u.legajo = :legajo
        AND ud.activo = true
    """)
    Optional<UserEntity> findByLegajoWithDepartamentosActivos(@Param("legajo") String legajo);

    Optional<UserEntity> findByLegajo(String legajo);

    boolean existsByLegajo(String legajo);

    @Query(
            value = """
        SELECT DISTINCT u
        FROM UserEntity u
        JOIN u.departamentos ud
        WHERE ud.departamento.id = :deptId
        AND ud.activo = true
        AND (:includeAdmins = true OR u.isAdmin = false)
        AND (
            :search = ''
            OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.apellido) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.legajo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(ud.email) LIKE LOWER(CONCAT('%', :search, '%'))
        )
    """,
            countQuery = """
        SELECT COUNT(DISTINCT u)
        FROM UserEntity u
        JOIN u.departamentos ud
        WHERE ud.departamento.id = :deptId
        AND ud.activo = true
        AND (:includeAdmins = true OR u.isAdmin = false)
        AND (
            :search = ''
            OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.apellido) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.legajo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(ud.email) LIKE LOWER(CONCAT('%', :search, '%'))
        )
    """
    )
    Page<UserEntity> findAllByDepartamentoId(
            @Param("deptId") Long deptId,
            @Param("search") String search,
            @Param("includeAdmins") boolean includeAdmins,
            Pageable pageable
    );
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import java.util.Optional;

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
        WHERE u.legajo = :legajo
    """)
    Optional<UserEntity> findByLegajoWithDepartamentos(@Param("legajo") String legajo);

    Optional<UserEntity> findByLegajo(String legajo);

    boolean existsByLegajo(String legajo);
}

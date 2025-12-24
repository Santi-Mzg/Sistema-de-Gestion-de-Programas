package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByLegajo(String legajo);
    boolean existsByLegajo(String legajo);
    List<UserEntity> findByDepartamentosDepartamentoId(Long departamentoId);

//    List<UserEntity> findAllByRoles(Rol rol);
}

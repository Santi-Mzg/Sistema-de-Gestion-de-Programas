package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.RolType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;

public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByName(RolType rol);

    Set<Rol> findAllByNameIn(Set<RolType> roles);

}

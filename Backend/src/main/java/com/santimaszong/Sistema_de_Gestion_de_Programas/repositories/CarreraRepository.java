package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarreraRepository extends JpaRepository<CarreraEntity, Long> {

}

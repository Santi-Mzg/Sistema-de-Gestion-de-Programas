package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgramaRepository extends JpaRepository<ProgramaEntity, Long> {

}

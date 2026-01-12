package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraPlanEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarreraPlanRepository extends JpaRepository<CarreraPlanEntity, Long> {

    @Query("""
        select m from ProgramaCarreraEntity pc
        join pc.programa p
        join p.materia m
        where pc.carreraPlan.id = :id
        """)
    List<MateriaEntity> findMateriasByCarreraPlanId(Long id);
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Set;

@Repository
public interface MateriaRepository extends JpaRepository<MateriaEntity, Long> {
    @Query("SELECT m FROM MateriaEntity m WHERE m.id IN :ids")
    Set<MateriaEntity> findAllByIdAsSet(@Param("ids") Collection<Long> ids);
}

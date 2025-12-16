package com.santimaszong.Sistema_de_Gestion_de_Programas.repositories;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioDepartamentoRepository extends JpaRepository<UsuarioDepartamentoEntity, Long> {

    Optional<UsuarioDepartamentoEntity> findByUsuarioIdAndDepartamentoId(Long usuarioId, Long departamentoId);
}

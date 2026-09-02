package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioDepartamentoService {
    List<UsuarioDepartamentoEntity> findByDepartamentoId(Long deptId);
    UsuarioDepartamentoEntity findByUsuarioIdAndDepartamentoId(Long userId, Long deptId);
    UsuarioDepartamentoEntity findByUsuarioLegajoAndDepartamentoId(String legajo, Long deptId);
    Optional<UsuarioDepartamentoEntity> findByUsuarioLegajoAndDepartamentoIdOptional(String legajo, Long deptId);
    UsuarioDepartamentoEntity save(UsuarioDepartamentoEntity entity);
    DepartamentoEntity getDeptEntityById(Long deptId);
    UserEntity getUserEntityById(Long userId);
    long countByDepartamentoId(Long deptId);
    long countByDepartamentoIdAndRolesContaining(Long deptId, Rol rol);
    List<UsuarioDepartamentoEntity> findFullByDepartamentoId(Long deptId);
}

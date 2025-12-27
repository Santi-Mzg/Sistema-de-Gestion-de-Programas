package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;

import java.util.List;

public interface UsuarioDepartamentoService {
    List<UsuarioDepartamentoEntity> findByDepartamentoId(Long deptId);
    UsuarioDepartamentoEntity findByUsuarioIdAndDepartamentoId(Long userId, Long deptId);
    UsuarioDepartamentoEntity findByUsuarioLegajoAndDepartamentoId(String legajo, Long deptId);
    UsuarioDepartamentoEntity save(UsuarioDepartamentoEntity entity);
    DepartamentoEntity getDeptEntityById(Long deptId);
    UserEntity getUserEntityById(Long userId);

}

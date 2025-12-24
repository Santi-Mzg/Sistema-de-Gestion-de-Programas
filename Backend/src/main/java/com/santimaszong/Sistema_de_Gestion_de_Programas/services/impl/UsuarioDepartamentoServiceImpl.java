package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UsuarioDepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.DepartamentoService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UserService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UsuarioDepartamentoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class UsuarioDepartamentoServiceImpl implements UsuarioDepartamentoService {

    private final DepartamentoService deptService;
    private final UsuarioDepartamentoRepository udeRepo;

    public UsuarioDepartamentoServiceImpl(DepartamentoService deptService, UserService userService, UsuarioDepartamentoRepository udeRepo) {
        this.deptService = deptService;
        this.udeRepo = udeRepo;
    }

    @Override
    public List<UsuarioDepartamentoEntity> findByDepartamentoId(Long deptId) {
        return udeRepo.findByDepartamentoId(deptId);
    }

    @Override
    public UsuarioDepartamentoEntity findByUsuarioIdAndDepartamentoId(Long userId, Long deptId) {
        return udeRepo.findByUsuarioIdAndDepartamentoId(userId, deptId).
                orElseThrow(() -> new EntityNotFoundException("El usuario indicado no esta relacionado con el departamento en cuestion."));
    }

    @Override
    public UsuarioDepartamentoEntity findByUsuarioLegajoAndDepartamentoId(String legajo, Long deptId) {
        return udeRepo.findByUsuarioLegajoAndDepartamentoId(legajo, deptId).
                orElseThrow(() -> new EntityNotFoundException("El usuario indicado no esta relacionado con el departamento en cuestion."));
    }
    @Override
    public UsuarioDepartamentoEntity save(UsuarioDepartamentoEntity entity) {
        return udeRepo.save(entity);
    }

    @Override
    public DepartamentoEntity getDeptEntityById(Long deptId) {
        return deptService.getEntityById(deptId);
    }

}

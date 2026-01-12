package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.DepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UsuarioDepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UsuarioDepartamentoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class UsuarioDepartamentoServiceImpl implements UsuarioDepartamentoService {

    private final DepartamentoRepository deptRepository;
    private final UserRepository userRepository;
    private final UsuarioDepartamentoRepository udeRepo;

    public UsuarioDepartamentoServiceImpl(DepartamentoRepository deptRepository, UserRepository userRepository, UsuarioDepartamentoRepository udeRepo) {
        this.deptRepository = deptRepository;
        this.userRepository = userRepository;
        this.udeRepo = udeRepo;
    }

    @Override
    public List<UsuarioDepartamentoEntity> findByDepartamentoId(Long deptId) {
        return udeRepo.findByDepartamentoId(deptId);
    }

    @Override
    public UsuarioDepartamentoEntity findByUsuarioIdAndDepartamentoId(Long userId, Long deptId) {
        return udeRepo.findByUsuarioIdAndDepartamentoId(userId, deptId).
                orElseThrow(() -> new IllegalStateException("El usuario indicado no esta relacionado con el departamento en cuestion."));
    }

    @Override
    public UsuarioDepartamentoEntity findByUsuarioLegajoAndDepartamentoId(String legajo, Long deptId) {
        return udeRepo.findByUsuarioLegajoAndDepartamentoId(legajo, deptId).
                orElseThrow(() -> new IllegalStateException("El usuario indicado no esta relacionado con el departamento en cuestion."));
    }
    @Override
    public UsuarioDepartamentoEntity save(UsuarioDepartamentoEntity entity) {
        return udeRepo.save(entity);
    }

    @Override
    public DepartamentoEntity getDeptEntityById(Long deptId) {
        return deptRepository.findById(deptId)
                .orElseThrow(() -> new EntityNotFoundException("Departamento no encontrado"));
    }

    @Override
    public UserEntity getUserEntityById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
    }

    @Override
    public List<UsuarioDepartamentoEntity> findFullByDepartamentoId(Long deptId) {
        return udeRepo.findFullByDepartamentoId(deptId);
    }


}

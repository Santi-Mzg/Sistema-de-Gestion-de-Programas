package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.DepartamentoDTO;

import java.util.List;
import java.util.Optional;

public interface DepartamentoService {
    DepartamentoDTO createDepartamento(DepartamentoDTO user);
    Optional<DepartamentoDTO> getDepartamentoById(Long id);
    List<DepartamentoDTO> listDepartamentos();
    Optional<DepartamentoDTO> updateDepartamento(Long id, DepartamentoDTO user);
    void deleteDepartamento(Long id);
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoResponseDTO;

import java.util.List;

public interface DepartamentoService {
    DepartamentoResponseDTO createDepartamento(DepartamentoCreateDTO user);
    DepartamentoResponseDTO getDepartamentoById(Long id);
    List<DepartamentoResponseDTO> listDepartamentos();
    DepartamentoResponseDTO updateDepartamento(Long id, DepartamentoCreateDTO user);
    DepartamentoResponseDTO updateSecretarioDepartamento(Long id, DepartamentoCreateDTO departamentoDTO);
    DepartamentoResponseDTO updateAdministracionDepartamento(Long id, DepartamentoCreateDTO departamentoDTO);
    void deleteDepartamento(Long id);
}

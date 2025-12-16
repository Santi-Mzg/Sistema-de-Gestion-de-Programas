package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoUpdateCargoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

public interface DepartamentoService {
    DepartamentoResponseDTO createDepartamento(DepartamentoCreateDTO user);
    DepartamentoResponseDTO getDepartamentoById(Long id);
    List<DepartamentoResponseDTO> listDepartamentos();
    List<MateriaResponseDTO> listMateriasByDepartamento(Long id);
//    List<UserResponseDTO> listProfesoresByDepartamento(Long id);
    DepartamentoResponseDTO updateDepartamento(Long id, DepartamentoCreateDTO user);
    void updateSecretaria(Long id, DepartamentoUpdateCargoDTO departamentoDTO);
    void updateDireccionAdministrativa(Long id, DepartamentoUpdateCargoDTO departamentoDTO);
    DepartamentoResponseDTO updateAdministracionDepartamento(Long id, DepartamentoCreateDTO departamentoDTO);
    void deleteDepartamento(Long id);
}

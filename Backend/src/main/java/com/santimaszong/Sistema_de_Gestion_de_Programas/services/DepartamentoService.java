package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import java.util.List;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoUpdateCargoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import org.springframework.security.core.Authentication;

public interface DepartamentoService {
    DepartamentoResponseDTO createDepartamento(DepartamentoCreateDTO user);
    DepartamentoResponseDTO getDepartamentoById(Long id);
    DepartamentoEntity getEntityById(Long id);
    List<DepartamentoResponseDTO> listDepartamentos();
    List<DepartamentoEntity> listEntities();
    DepartamentoResponseDTO updateDepartamento(Long id, DepartamentoCreateDTO user);
    void updateSecretaria(Long id, DepartamentoUpdateCargoDTO departamentoDTO);
    void updateDireccionAdministrativa(Long id, DepartamentoUpdateCargoDTO departamentoDTO);
    DepartamentoResponseDTO updateAdministracionDepartamento(Long id, DepartamentoCreateDTO departamentoDTO);
    void deleteDepartamento(Long id);

    DepartamentoEntity findEntityWithAreasById(Long id);
    DepartamentoEntity findEntityWithCarrerasById(Long id);
    DepartamentoEntity findEntityWithMateriasById(Long id);
}

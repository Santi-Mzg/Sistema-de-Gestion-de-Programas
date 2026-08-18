package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraPlanEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface CarreraService {
    CarreraResponseDTO createCarrera(Long deptId, CarreraCreateDTO carrera);
    CarreraResponseDTO getCarreraById(Long id);
    CarreraEntity getCarreraEntityById(Long id);
    CarreraPlanEntity getPlanEntityById(Long id);
    CarreraResponseDTO findEntityWithPlanesById(Long id);
    List<CarreraResponseDTO> listCarreras();
    Page<CarreraResponseDTO> listCarrerasDepartamento(Long deptId, String search, Pageable pageable);
    List<MateriaEntity> listMateriasCarreraPlan(Long id);
    CarreraResponseDTO updateCarrera(Long id, CarreraCreateDTO carrera);
    void updateComision(Long id, CarreraUpdateComisionDTO carreraDTO);
    void deleteCarrera(Long id);
    long countByDepartamentoId(Long deptId);
    CarreraPlanResponseDTO createCarreraPlan(Long carreraId, CarreraPlanCreateDTO planDTO);
    void deleteCarreraPlan(Long id);

}

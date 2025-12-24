package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraUpdateComisionDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

public interface CarreraService {
    CarreraResponseDTO createCarrera(CarreraCreateDTO carrera);
    CarreraResponseDTO getCarreraById(Long id);
    CarreraEntity getEntityById(Long id);
    List<CarreraResponseDTO> listCarreras();
    List<MateriaResponseDTO> listMateriasByCarrera(@PathVariable Long id);
    CarreraResponseDTO updateCarrera(Long id, CarreraCreateDTO carrera);
    void updateComision(Long id, CarreraUpdateComisionDTO carreraDTO);
    void deleteCarrera(Long id);
}

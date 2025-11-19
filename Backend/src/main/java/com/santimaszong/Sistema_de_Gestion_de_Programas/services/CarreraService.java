package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;

import java.util.List;

public interface CarreraService {
    CarreraResponseDTO createCarrera(CarreraCreateDTO user);
    CarreraResponseDTO getCarreraById(Long id);
    List<CarreraResponseDTO> listCarreras();
    CarreraResponseDTO updateCarrera(Long id, CarreraCreateDTO user);
    void deleteCarrera(Long id);
}

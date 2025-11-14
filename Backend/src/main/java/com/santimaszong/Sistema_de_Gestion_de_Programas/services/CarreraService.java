package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.CarreraDTO;

import java.util.List;
import java.util.Optional;

public interface CarreraService {
    CarreraDTO createCarrera(CarreraDTO user);
    Optional<CarreraDTO> getCarreraById(Long id);
    List<CarreraDTO> listCarreras();
    CarreraDTO updateCarrera(Long id, CarreraDTO user);
    void deleteCarrera(Long id);
}

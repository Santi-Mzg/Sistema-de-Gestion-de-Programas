package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.CarreraDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.CarreraRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.CarreraService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CarreraServiceImpl implements CarreraService {

    private final CarreraRepository carreraRepository;
    private Mapper<CarreraDTO, CarreraEntity> carreraMapper;

    public CarreraServiceImpl(CarreraRepository carreraRepository, Mapper<CarreraDTO, CarreraEntity> carreraMapper) {
        this.carreraRepository = carreraRepository;
        this.carreraMapper = carreraMapper;
    }


    @Override
    public CarreraDTO createCarrera(CarreraDTO carreraDTO){
        CarreraEntity carreraEntity = carreraMapper.mapTo(carreraDTO);
        CarreraEntity createdCarreraEntity = carreraRepository.save(carreraEntity);

//        if(createdCarreraEntity==null)
//            throw new Exception("Error al crear el usuario.");

        return carreraMapper.mapFrom(createdCarreraEntity);
    }

    @Override
    public Optional<CarreraDTO> getCarreraById(Long id) {
        Optional<CarreraEntity> foundCarrera = carreraRepository.findById(id);

        return foundCarrera.map(carreraMapper::mapFrom);
    }

    @Override
    public List<CarreraDTO> listCarreras() {
        List<CarreraEntity> carreras = carreraRepository.findAll();
        return carreras.stream()
                .map(carreraMapper::mapFrom)
                .collect(Collectors.toList());
    }

    @Override
    public CarreraDTO updateCarrera(Long id, CarreraDTO carreraDTO) {
        if(!carreraRepository.existsById(id)) {
            throw new EntityNotFoundException("La entidad con ID " + id + " no fue encontrada.");
        }

        CarreraEntity carreraEntity = carreraMapper.mapTo(carreraDTO);
        CarreraEntity savedCarreraEntity = carreraRepository.save(carreraEntity);

        return carreraMapper.mapFrom(savedCarreraEntity);
    }

    @Override
    public void deleteCarrera(Long id) {
        carreraRepository.deleteById(id);
    }
}

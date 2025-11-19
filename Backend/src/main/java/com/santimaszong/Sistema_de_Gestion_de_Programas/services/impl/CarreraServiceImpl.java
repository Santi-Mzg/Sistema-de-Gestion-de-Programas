package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.CarreraMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.CarreraRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.DepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.CarreraService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CarreraServiceImpl implements CarreraService {

    private final CarreraRepository carreraRepository;
    private final DepartamentoRepository departamentoRepository;
    private final UserRepository userRepository;
    private final CarreraMapper carreraMapper;

    public CarreraServiceImpl(CarreraRepository carreraRepository, DepartamentoRepository departamentoRepository, UserRepository userRepository, CarreraMapper carreraMapper) {
        this.carreraRepository = carreraRepository;
        this.departamentoRepository = departamentoRepository;
        this.userRepository = userRepository;
        this.carreraMapper = carreraMapper;
    }


    @Override
    public CarreraResponseDTO createCarrera(CarreraCreateDTO carreraDTO){
        CarreraEntity carreraEntity = carreraMapper.toEntity(carreraDTO);

        DepartamentoEntity departamento = departamentoRepository.findById(carreraDTO.getDepartamentoId())
                .orElseThrow(
                        () -> new EntityNotFoundException("El Departamento " + carreraDTO.getNombre() + " con ID " + carreraDTO.getDepartamentoId() + "no fue encontrado.")
                );

        UserEntity comision = userRepository.findById(carreraDTO.getComisionId())
                .orElseThrow(
                        () -> new EntityNotFoundException("El Coordinador de la carrera " + carreraDTO.getNombre() + " con ID " + carreraDTO.getComisionId() + "no fue encontrado.")
                );

        carreraEntity.setDepartamento(departamento);
        carreraEntity.setComision(comision);
        CarreraEntity createdCarreraEntity = carreraRepository.save(carreraEntity);

        return carreraMapper.toDTO(createdCarreraEntity);
    }

    @Override
    public Optional<CarreraResponseDTO> getCarreraById(Long id) {
        Optional<CarreraEntity> foundCarrera = carreraRepository.findById(id);

        return foundCarrera.map(carreraMapper::toDTO);
    }

    @Override
    public List<CarreraResponseDTO> listCarreras() {
        List<CarreraEntity> carreras = carreraRepository.findAll();
        return carreras.stream()
                .map(carreraMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CarreraResponseDTO updateCarrera(Long id, CarreraCreateDTO carreraDTO) {
        return carreraRepository.findById(id).map(existingCarrera -> {
            Optional.ofNullable(carreraDTO.getNombre()).ifPresent(existingCarrera::setNombre);
            Optional.ofNullable(carreraDTO.getCodigo()).ifPresent(existingCarrera::setCodigo);
            Optional.ofNullable(carreraDTO.getDuracion()).ifPresent(existingCarrera::setDuracion);
            Optional.ofNullable(carreraDTO.getCantidadMaterias()).ifPresent(existingCarrera::setCantidadMaterias);

            CarreraEntity savedCarreraEntity = carreraRepository.save(existingCarrera);

            return carreraMapper.toDTO(savedCarreraEntity);
        }).orElseThrow(() -> new RuntimeException("Carrera no existente"));
    }

    @Override
    public void deleteCarrera(Long id) {
        carreraRepository.deleteById(id);
    }
}

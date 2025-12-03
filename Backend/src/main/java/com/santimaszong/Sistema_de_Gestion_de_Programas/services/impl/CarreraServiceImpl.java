package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.CarreraMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.MateriaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.CarreraRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.DepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.CarreraService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class CarreraServiceImpl implements CarreraService {

    private final CarreraRepository carreraRepository;
    private final DepartamentoRepository departamentoRepository;
    private final UserRepository userRepository;
    private final CarreraMapper carreraMapper;
    private final MateriaMapper materiaMapper;


    public CarreraServiceImpl(CarreraRepository carreraRepository, DepartamentoRepository departamentoRepository, UserRepository userRepository, CarreraMapper carreraMapper, MateriaMapper materiaMapper) {
        this.carreraRepository = carreraRepository;
        this.departamentoRepository = departamentoRepository;
        this.userRepository = userRepository;
        this.carreraMapper = carreraMapper;
        this.materiaMapper = materiaMapper;
    }


    @Override
    public CarreraResponseDTO createCarrera(CarreraCreateDTO carreraDTO){
        CarreraEntity carreraEntity = carreraMapper.toEntity(carreraDTO);

        DepartamentoEntity departamento = departamentoRepository.findById(carreraDTO.getDepartamentoId())
                .orElseThrow(
                        () -> new EntityNotFoundException("El Departamento de la carrera " + carreraDTO.getNombre() + " con ID " + carreraDTO.getDepartamentoId() + "no fue encontrado.")
                );

//        UserEntity comision = userRepository.findById(carreraDTO.getComisionId())
//                .orElseThrow(
//                        () -> new EntityNotFoundException("El Coordinador de la carrera " + carreraDTO.getNombre() + " con ID " + carreraDTO.getComisionId() + "no fue encontrado.")
//                );

        carreraEntity.setDepartamento(departamento);
//        carreraEntity.setComision(comision);
        CarreraEntity createdCarreraEntity = carreraRepository.save(carreraEntity);

        return carreraMapper.toDTO(createdCarreraEntity);
    }

    @Override
    public CarreraResponseDTO getCarreraById(Long id) {
        CarreraEntity foundCarrera = carreraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Carrera no existente"));

        return carreraMapper.toDTO(foundCarrera);
    }

    @Override
    public List<CarreraResponseDTO> listCarreras() {
        List<CarreraEntity> carreras = carreraRepository.findAll();
        return carreras.stream()
                .map(carreraMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MateriaResponseDTO> listMateriasByCarrera(@PathVariable Long id) {
        CarreraEntity carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Carrera no encontrada"));

        Stream<MateriaEntity> materias = carrera.getMaterias().stream()
                .map(ProgramaCarreraEntity::getPrograma)
                .map(ProgramaEntity::getMateria);

        return materias.map(materiaMapper::toDTO)
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
        }).orElseThrow(() -> new EntityNotFoundException("Carrera no existente"));
    }

    @Override
    public CarreraResponseDTO updateComisionCarrera(Long id, CarreraCreateDTO carreraDTO) {

        return carreraRepository.findById(id).map(existingCarrera -> {

//            Optional.ofNullable(carreraDTO.getComisionId()).ifPresent(comisionId -> {
//
//                userRepository.findById(comisionId).ifPresent(nuevaComision -> {
//                    existingCarrera.setComision(nuevaComision);
//                });
//            });

            CarreraEntity savedCarreraEntity = carreraRepository.save(existingCarrera);

            return carreraMapper.toDTO(savedCarreraEntity);
        }).orElseThrow(() -> new EntityNotFoundException("Carrera no existente"));
    }

    @Override
    public void deleteCarrera(Long id) {
        carreraRepository.deleteById(id);
    }
}

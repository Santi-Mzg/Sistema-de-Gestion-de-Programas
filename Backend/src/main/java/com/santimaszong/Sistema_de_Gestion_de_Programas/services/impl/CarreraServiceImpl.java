package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraUpdateComisionDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.CarreraMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.MateriaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.CarreraRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.DepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UsuarioDepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.CarreraService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.DepartamentoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class CarreraServiceImpl implements CarreraService {

    private final CarreraRepository carreraRepository;
    private final DepartamentoService departamentoService;
    private final UserRepository userRepository;
    private final CarreraMapper carreraMapper;
    private final MateriaMapper materiaMapper;


    public CarreraServiceImpl(CarreraRepository carreraRepository, DepartamentoService departamentoService, UserRepository userRepository, CarreraMapper carreraMapper, MateriaMapper materiaMapper) {
        this.carreraRepository = carreraRepository;
        this.departamentoService = departamentoService;
        this.userRepository = userRepository;
        this.carreraMapper = carreraMapper;
        this.materiaMapper = materiaMapper;
    }


    @Override
    public CarreraResponseDTO createCarrera(Long deptId, CarreraCreateDTO carreraDTO){
        CarreraEntity carreraEntity = carreraMapper.toEntity(carreraDTO);

        DepartamentoEntity departamento = departamentoService.getEntityById(deptId);

        carreraEntity.setDepartamento(departamento);
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
    public CarreraEntity getEntityById(Long id) {
        return carreraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Carrera no existente"));
    }

    @Override
    public List<CarreraResponseDTO> listCarreras() {
        List<CarreraEntity> carreras = carreraRepository.findAll();
        return carreras.stream()
                .map(carreraMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CarreraResponseDTO> listCarrerasDepartamento(Long id) {
        DepartamentoEntity departamento = departamentoService.getEntityById(id);

        List<CarreraEntity> carreras = departamento.getCarreras();

        return carreras.stream()
                .map(carreraMapper::toDTO)
                .collect(Collectors.toList());
    };

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
            Optional.ofNullable(carreraDTO.getPlan()).ifPresent(existingCarrera::setPlan);
            Optional.ofNullable(carreraDTO.getDuracion()).ifPresent(existingCarrera::setDuracion);

            CarreraEntity savedCarreraEntity = carreraRepository.save(existingCarrera);

            return carreraMapper.toDTO(savedCarreraEntity);
        }).orElseThrow(() -> new EntityNotFoundException("Carrera no existente"));
    }

    @Override
    @Transactional
    public void updateComision(Long id, CarreraUpdateComisionDTO carreraDTO) {

        CarreraEntity carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Carrera no existente"));

        DepartamentoEntity dpto = carrera.getDepartamento();
        Long nuevaComisionId = carreraDTO.getComisionId();

        if (nuevaComisionId == null) {
            throw new IllegalArgumentException("Debe enviar un comisionId");
        }

        UserEntity nuevaComision = userRepository.findById(nuevaComisionId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario comision no existente"));


        UsuarioDepartamentoEntity udeNuevaComision = dpto.getUsuarios().stream()
                .filter(ude -> ude.getUsuario().getId().equals(nuevaComisionId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Usuario no relacionado al departamento"));

        UsuarioDepartamentoEntity udeViejaComision = carrera.getComision();
        if (udeViejaComision != null && udeViejaComision.getCarrerasComoComision().isEmpty()){
            udeViejaComision.getRoles().remove(Rol.COORDINACION_COMISION_CURRICULAR); // Saca rol a comision vieja si no tiene mas carreras como comision
        }

        udeNuevaComision.getRoles().add(Rol.COORDINACION_COMISION_CURRICULAR); // Da rol a nueva comision
        carrera.setComision(udeNuevaComision); // Cambia de comision


        carreraRepository.save(carrera);
    }

    @Override
    public void deleteCarrera(Long id) {
        carreraRepository.deleteById(id);
    }
}

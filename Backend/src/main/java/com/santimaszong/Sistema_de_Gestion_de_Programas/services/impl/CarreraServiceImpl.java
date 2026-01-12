package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.CarreraMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.CarreraPlanMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.CarreraPlanRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.CarreraRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.CarreraService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.DepartamentoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CarreraServiceImpl implements CarreraService {

    private final CarreraRepository carreraRepository;
    private final CarreraPlanRepository planRepository;
    private final DepartamentoService departamentoService;
    private final UserRepository userRepository;
    private final CarreraMapper carreraMapper;
    private final CarreraPlanMapper planMapper;

    public CarreraServiceImpl(CarreraRepository carreraRepository,
                              CarreraPlanRepository planRepository,
                              DepartamentoService departamentoService,
                              UserRepository userRepository,
                              CarreraMapper carreraMapper,
                              CarreraPlanMapper planMapper) {
        this.carreraRepository = carreraRepository;
        this.planRepository = planRepository;
        this.departamentoService = departamentoService;
        this.userRepository = userRepository;
        this.carreraMapper = carreraMapper;
        this.planMapper = planMapper;
    }


    @Override
    @Transactional
    public CarreraResponseDTO createCarrera(Long deptId, CarreraCreateDTO carreraDTO){
        CarreraEntity carreraEntity = carreraMapper.toEntity(carreraDTO);

        DepartamentoEntity departamento = departamentoService.getEntityById(deptId);
        carreraEntity.setDepartamento(departamento);

        CarreraEntity createdCarreraEntity = carreraRepository.save(carreraEntity);

        CarreraPlanEntity plan = new CarreraPlanEntity();
        plan.setAnio(carreraDTO.getPlanAnio());
        plan.setVersion(carreraDTO.getPlanVersion());
        plan.setCarrera(carreraEntity);

        planRepository.save(plan);

        return carreraMapper.toDTO(createdCarreraEntity);
    }

    @Override
    @Transactional
    public CarreraPlanResponseDTO createCarreraPlan(Long carreraId, CarreraPlanCreateDTO planDTO){
        CarreraPlanEntity planEntity = planMapper.toEntity(planDTO);

        CarreraEntity carrera = carreraRepository.findById(carreraId)
                .orElseThrow(() -> new EntityNotFoundException("Carrera no encontrada"));

        planEntity.setCarrera(carrera);

        CarreraPlanEntity createdPlanEntity = planRepository.save(planEntity);

        return planMapper.toDTO(createdPlanEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public CarreraResponseDTO getCarreraById(Long id) {
        CarreraEntity foundCarrera = carreraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Carrera no existente"));

        return carreraMapper.toDTO(foundCarrera);
    }

    @Override
    @Transactional(readOnly = true)
    public CarreraEntity getCarreraEntityById(Long id) {
        return carreraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Carrera no existente"));
    }

    @Override
    @Transactional(readOnly = true)
    public CarreraPlanEntity getPlanEntityById(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Plan no existente"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CarreraResponseDTO> listCarreras() {
        List<CarreraEntity> carreras = carreraRepository.findAll();
        return carreras.stream()
                .map(carreraMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CarreraResponseDTO> listCarrerasDepartamento(Long id) {
        DepartamentoEntity departamento = departamentoService.findEntityWithCarrerasById(id);

        return departamento.getCarreras()
                .stream()
                .map(carreraMapper::toDTO)
                .toList();
    };

    @Override
    @Transactional(readOnly = true)
    public List<MateriaEntity> listMateriasCarreraPlan(Long id) {
        return planRepository.findMateriasByCarreraPlanId(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CarreraResponseDTO findEntityWithPlanesById(Long id) {
        CarreraEntity carrera = carreraRepository.findWithPlanesById(id)
                .orElseThrow(() -> new EntityNotFoundException("Carrera no existente"));

        return carreraMapper.toDTO(carrera);
    }


    @Override
    @Transactional
    public CarreraResponseDTO updateCarrera(Long id, CarreraCreateDTO carreraDTO) {
        return carreraRepository.findById(id).map(existingCarrera -> {
            Optional.ofNullable(carreraDTO.getNombre()).ifPresent(existingCarrera::setNombre);
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
    @Transactional
    public void deleteCarrera(Long id) {
        carreraRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteCarreraPlan(Long id) {
        planRepository.deleteById(id);
    }
}

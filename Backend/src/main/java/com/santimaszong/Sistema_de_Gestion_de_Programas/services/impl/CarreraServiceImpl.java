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
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UsuarioDepartamentoService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final UsuarioDepartamentoService userDptoService;
    private final UserRepository userRepository;
    private final CarreraMapper carreraMapper;
    private final CarreraPlanMapper planMapper;
    private final EmailService emailService;

    public CarreraServiceImpl(CarreraRepository carreraRepository,
                              CarreraPlanRepository planRepository,
                              DepartamentoService departamentoService,
                              UsuarioDepartamentoService userDptoService,
                              UserRepository userRepository,
                              CarreraMapper carreraMapper,
                              CarreraPlanMapper planMapper,
                              EmailService emailService) {
        this.carreraRepository = carreraRepository;
        this.planRepository = planRepository;
        this.departamentoService = departamentoService;
        this.userDptoService = userDptoService;
        this.userRepository = userRepository;
        this.carreraMapper = carreraMapper;
        this.planMapper = planMapper;
        this.emailService = emailService;
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
    public Page<CarreraResponseDTO> listCarrerasDepartamento(Long id, String search, Pageable pageable) {
        String normalizedSearch =
                search == null || search.isBlank()
                        ? ""
                        : search.trim();

        return carreraRepository.findAllByDepartamentoId(id, normalizedSearch, pageable)
                .map(carreraMapper::toDTO);
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

        emailService.sendEmailAsignacionCargo(udeNuevaComision.getEmail(), nuevaComision, "Representante de la Comisión Curricular", "Carrera", carrera.getNombre());
        if(udeViejaComision != null && !udeViejaComision.getUsuario().getId().equals(nuevaComisionId)) {
            emailService.sendEmailRemocionCargo(udeViejaComision.getEmail(), udeViejaComision.getUsuario(), "Representante de la Comisión Curricular", "Carrera", carrera.getNombre());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long countByDepartamentoId(Long deptId) {
        return carreraRepository.countByDepartamentoId(deptId);
    }

    @Override
    @Transactional
    public void deleteCarrera(Long id) {
        CarreraEntity carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe la carrera"));
        UsuarioDepartamentoEntity udeExComision = carrera.getComision();
        udeExComision.getRoles().remove(Rol.COORDINACION_COMISION_CURRICULAR);
        userDptoService.save(udeExComision);
        carreraRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteCarreraPlan(Long id) {
        planRepository.deleteById(id);
    }
}

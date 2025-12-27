package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoUpdateCargoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.DepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UsuarioDepartamentoService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.DepartamentoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DepartamentoServiceImpl implements DepartamentoService {

    private final DepartamentoRepository departamentoRepository;
    private final UsuarioDepartamentoService userDptoService;

    private final DepartamentoMapper departamentoMapper;
    private final UserMapper userMapper;


    public DepartamentoServiceImpl(DepartamentoRepository departamentoRepository, UsuarioDepartamentoService userDptoService, DepartamentoMapper departamentoMapper, UserMapper userMapper) {
        this.departamentoRepository = departamentoRepository;
        this.userDptoService = userDptoService;
        this.departamentoMapper = departamentoMapper;
        this.userMapper = userMapper;
    }


    @Override
    public DepartamentoResponseDTO createDepartamento(DepartamentoCreateDTO departamentoDTO) {
        DepartamentoEntity existingDepartamento = departamentoMapper.toEntity(departamentoDTO);
        DepartamentoEntity createdDepartamentoEntity = departamentoRepository.save(existingDepartamento);

        return departamentoMapper.toDTO(createdDepartamentoEntity);
    }

    @Override
    public DepartamentoResponseDTO getDepartamentoById(Long id) {
        DepartamentoEntity foundDepartamento = departamentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Departamento no existente"));

        return departamentoMapper.toDTO(foundDepartamento);
    }

    @Override
    public DepartamentoEntity getEntityById(Long id) {
        return departamentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Departamento no existente"));
    }

    @Override
    public List<DepartamentoResponseDTO> listDepartamentos() {
        List<DepartamentoEntity> departamentos = departamentoRepository.findAll();
        return departamentos.stream()
                .map(departamentoMapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    public DepartamentoResponseDTO updateDepartamento(Long id, DepartamentoCreateDTO departamentoDTO) {

        return departamentoRepository.findById(id).map(existingDepartamento -> {
                    Optional.ofNullable(departamentoDTO.getNombre()).ifPresent(existingDepartamento::setNombre);
                    Optional.ofNullable(departamentoDTO.getDireccion()).ifPresent(existingDepartamento::setDireccion);
                    Optional.ofNullable(departamentoDTO.getTelefono()).ifPresent(existingDepartamento::setTelefono);
                    Optional.ofNullable(departamentoDTO.getEmail()).ifPresent(existingDepartamento::setEmail);
                    Optional.ofNullable(departamentoDTO.getSitioWeb()).ifPresent(existingDepartamento::setSitioWeb);
                    Optional.ofNullable(departamentoDTO.getSitioWeb()).ifPresent(existingDepartamento::setSitioWeb);

                    DepartamentoEntity savedDepartamentoEntity = departamentoRepository.save(existingDepartamento);

                    return departamentoMapper.toDTO(savedDepartamentoEntity);
                }).orElseThrow(() -> new EntityNotFoundException("Departamento no existente"));
    }

    @Override
    @Transactional
    public void updateSecretaria(Long id, DepartamentoUpdateCargoDTO departamentoDTO) {

        DepartamentoEntity dpto = departamentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Departamento no existente"));

        Long nuevaSecretariaId = departamentoDTO.getUsuarioId();

        if (nuevaSecretariaId == null) {
            throw new IllegalArgumentException("Debe enviar un secretariaId");
        }

        dpto.getUsuarios().forEach(ude -> { // Elimina secretario anterior
            ude.getRoles().remove(Rol.SECRETARIA);
        });

        UsuarioDepartamentoEntity udeNuevoSecretario = userDptoService.findByUsuarioIdAndDepartamentoId(nuevaSecretariaId, id);

        udeNuevoSecretario.getRoles().add(Rol.SECRETARIA);

        userDptoService.save(udeNuevoSecretario);
    }

    @Override
    @Transactional
    public void updateDireccionAdministrativa(Long id, DepartamentoUpdateCargoDTO departamentoDTO) {

        DepartamentoEntity dpto = departamentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Departamento no existente"));

        Long nuevaDireccionId = departamentoDTO.getUsuarioId();

        if (nuevaDireccionId == null) {
            throw new IllegalArgumentException("Debe enviar un direccionAdministrativaId");
        }

        dpto.getUsuarios().forEach(ude -> { // Elimina direccion anterior
            ude.getRoles().remove(Rol.DIRECCION_ADMINISTRATIVA);
        });

        UsuarioDepartamentoEntity udeNuevaDireccion = userDptoService.findByUsuarioIdAndDepartamentoId(nuevaDireccionId, id);

        udeNuevaDireccion.getRoles().add(Rol.DIRECCION_ADMINISTRATIVA);

        userDptoService.save(udeNuevaDireccion);

    }

    @Override
    public DepartamentoResponseDTO updateAdministracionDepartamento(Long id, DepartamentoCreateDTO departamentoDTO) {
            return null;
//        return departamentoRepository.findById(id).map(existingDepartamento -> {
//            Optional.ofNullable(departamentoDTO.getAdministracionIds()).ifPresent(administracionIds -> {
//                List<UserEntity> administracion = userService.findAllById(administracionIds);
//
//                if (departamentoDTO.getAdministracionIds().size() != administracion.size()) {
//                    throw new EntityNotFoundException("Uno o más Administrativos no fueron encontrados. Por favor, verifique los IDs.");
//                }
//
//                existingDepartamento.setAdministracion(administracion);
//            });
//
//            DepartamentoEntity savedDepartamentoEntity = departamentoRepository.save(existingDepartamento);
//
//            return departamentoMapper.toDTO(savedDepartamentoEntity);
//        }).orElseThrow(() -> new EntityNotFoundException("Departamento no existente"));
    }

    @Override
    public void deleteDepartamento(Long id) {
        departamentoRepository.deleteById(id);
    }

}

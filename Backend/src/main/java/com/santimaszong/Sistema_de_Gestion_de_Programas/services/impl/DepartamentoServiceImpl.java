package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.DepartamentoMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.DepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.DepartamentoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DepartamentoServiceImpl implements DepartamentoService {

    private final DepartamentoRepository departamentoRepository;
    private final UserRepository userRepository;

    private final DepartamentoMapper departamentoMapper;

    public DepartamentoServiceImpl(DepartamentoRepository departamentoRepository, UserRepository userRepository, DepartamentoMapper departamentoMapper) {
        this.departamentoRepository = departamentoRepository;
        this.userRepository = userRepository;
        this.departamentoMapper = departamentoMapper;
    }


    @Override
    public DepartamentoResponseDTO createDepartamento(DepartamentoCreateDTO departamentoDTO) {
        DepartamentoEntity existingDepartamento = departamentoMapper.toEntity(departamentoDTO);

        List<UserEntity> administracion = userRepository.findAllById(departamentoDTO.getAdministracionIds());
        if(departamentoDTO.getAdministracionIds().size() != administracion.size()) {
            throw new EntityNotFoundException("Uno o más Administrativos no fueron encontrados. Por favor, verifique los IDs.");
        }

        UserEntity secretaria = userRepository.findById(departamentoDTO.getSecretariaId())
                .orElseThrow(
                        () -> new EntityNotFoundException("El Secretario del departamento " + departamentoDTO.getNombre() + " con ID " + departamentoDTO.getSecretariaId() + "no fue encontrado.")
                );

        existingDepartamento.setAdministracion(administracion);
        existingDepartamento.setSecretaria(secretaria);

        DepartamentoEntity createdDepartamentoEntity = departamentoRepository.save(existingDepartamento);

        return departamentoMapper.toDTO(createdDepartamentoEntity);
    }

    @Override
    public Optional<DepartamentoResponseDTO> getDepartamentoById(Long id) {
        Optional<DepartamentoEntity> foundDepartamento = departamentoRepository.findById(id);

        return foundDepartamento.map(departamentoMapper::toDTO);
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
                    Optional.ofNullable(departamentoDTO.getCuerpo()).ifPresent(existingDepartamento::setNombre);
                    Optional.ofNullable(departamentoDTO.getEmail()).ifPresent(existingDepartamento::setEmail);
                    Optional.ofNullable(departamentoDTO.getSitioWeb()).ifPresent(existingDepartamento::setSitioWeb);

                    DepartamentoEntity savedDepartamentoEntity = departamentoRepository.save(existingDepartamento);

                    return departamentoMapper.toDTO(savedDepartamentoEntity);
                }).orElseThrow(() -> new RuntimeException("Departamento no existente"));
    }

    @Override
    public DepartamentoResponseDTO updateSecretarioDepartamento(Long id, DepartamentoCreateDTO departamentoDTO) {

        return departamentoRepository.findById(id).map(existingDepartamento -> {
            Optional.ofNullable(departamentoDTO.getSecretariaId()).ifPresent( secretariaId -> {
                userRepository.findById(secretariaId).ifPresent(secretariaEntity -> {
                    existingDepartamento.setSecretaria(secretariaEntity);
                });
            });

            DepartamentoEntity savedDepartamentoEntity = departamentoRepository.save(existingDepartamento);

            return departamentoMapper.toDTO(savedDepartamentoEntity);
        }).orElseThrow(() -> new RuntimeException("Departamento no existente"));
    }

    @Override
    public DepartamentoResponseDTO updateAdministracionDepartamento(Long id, DepartamentoCreateDTO departamentoDTO) {

        return departamentoRepository.findById(id).map(existingDepartamento -> {
            Optional.ofNullable(departamentoDTO.getAdministracionIds()).ifPresent(administracionIds -> {
                List<UserEntity> administracion = userRepository.findAllById(administracionIds);

                if (departamentoDTO.getAdministracionIds().size() != administracion.size()) {
                    throw new EntityNotFoundException("Uno o más Administrativos no fueron encontrados. Por favor, verifique los IDs.");
                }

                existingDepartamento.setAdministracion(administracion);
            });

            DepartamentoEntity savedDepartamentoEntity = departamentoRepository.save(existingDepartamento);

            return departamentoMapper.toDTO(savedDepartamentoEntity);
        }).orElseThrow(() -> new RuntimeException("Departamento no existente"));
    }

    @Override
    public void deleteDepartamento(Long id) {
        departamentoRepository.deleteById(id);
    }
}

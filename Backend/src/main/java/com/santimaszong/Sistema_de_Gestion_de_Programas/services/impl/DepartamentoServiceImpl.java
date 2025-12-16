package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoUpdateCargoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.DepartamentoMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.MateriaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.DepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UsuarioDepartamentoRepository;
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
    private final UserRepository userRepository;
    private final UsuarioDepartamentoRepository userDptoRepository;

    private final DepartamentoMapper departamentoMapper;
    private final MateriaMapper materiaMapper;


    public DepartamentoServiceImpl(DepartamentoRepository departamentoRepository, UserRepository userRepository, UsuarioDepartamentoRepository userDptoRepository, DepartamentoMapper departamentoMapper, MateriaMapper materiaMapper) {
        this.departamentoRepository = departamentoRepository;
        this.userRepository = userRepository;
        this.userDptoRepository = userDptoRepository;
        this.departamentoMapper = departamentoMapper;
        this.materiaMapper = materiaMapper;
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
    public List<DepartamentoResponseDTO> listDepartamentos() {
        List<DepartamentoEntity> departamentos = departamentoRepository.findAll();
        return departamentos.stream()
                .map(departamentoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MateriaResponseDTO> listMateriasByDepartamento(Long id) {
        DepartamentoEntity departamento = departamentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Departamento no encontrado"));

        List<MateriaEntity> materias = departamento.getMaterias();

        return materias.stream()
                .map(materiaMapper::toDTO)
                .collect(Collectors.toList());
    };

//    @Override
//    public List<UserResponseDTO> listProfesoresByDepartamento(Long id) {
//        DepartamentoEntity departamento = departamentoRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Departamento no encontrado"));
//
//        List<UserEntity> profesores = departamento.get;
//
//        return materias.stream()
//                .map(materiaMapper::toDTO)
//                .collect(Collectors.toList());
//    }



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

        UserEntity nuevaSecretaria = userRepository.findById(nuevaSecretariaId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario secretario no existente"));

        dpto.getUsuarios().forEach(ude -> { // Elimina secretario anterior
            ude.getRoles().remove(Rol.SECRETARIA);
        });

        UsuarioDepartamentoEntity udeNuevoSecretario = dpto.getUsuarios().stream()
                .filter(ude -> ude.getUsuario().getId().equals(nuevaSecretariaId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Usuario no relacionado al departamento"));

        udeNuevoSecretario.getRoles().add(Rol.SECRETARIA);

        userDptoRepository.save(udeNuevoSecretario);
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

        UserEntity nuevaDireccion = userRepository.findById(nuevaDireccionId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario director administrativo no existente"));

        dpto.getUsuarios().forEach(ude -> { // Elimina direccion anterior
            ude.getRoles().remove(Rol.DIRECCION_ADMINISTRATIVA);
        });

        UsuarioDepartamentoEntity udeNuevaDireccion = dpto.getUsuarios().stream()
                .filter(ude -> ude.getUsuario().getId().equals(nuevaDireccionId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Usuario no relacionado al departamento"));

        udeNuevaDireccion.getRoles().add(Rol.DIRECCION_ADMINISTRATIVA);

        userDptoRepository.save(udeNuevaDireccion);

    }

    @Override
    public DepartamentoResponseDTO updateAdministracionDepartamento(Long id, DepartamentoCreateDTO departamentoDTO) {
            return null;
//        return departamentoRepository.findById(id).map(existingDepartamento -> {
//            Optional.ofNullable(departamentoDTO.getAdministracionIds()).ifPresent(administracionIds -> {
//                List<UserEntity> administracion = userRepository.findAllById(administracionIds);
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

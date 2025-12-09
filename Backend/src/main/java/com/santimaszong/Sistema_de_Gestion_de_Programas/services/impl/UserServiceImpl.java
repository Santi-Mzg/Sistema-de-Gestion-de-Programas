package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.UserMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.CarreraRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.DepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final DepartamentoRepository departamentoRepository;
    private final CarreraRepository carreraRepository;

    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository, DepartamentoRepository departamentoRepository, CarreraRepository carreraRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.departamentoRepository = departamentoRepository;
        this.carreraRepository = carreraRepository;
        this.userMapper = userMapper;
    }


    @Override
    public UserResponseDTO createUser(UserCreateDTO userDTO){
        UserEntity userEntity = userMapper.toEntity(userDTO);

//        DepartamentoEntity departamento = departamentoRepository.findById(userDTO.getDepartamentoAdministracionId())
//                .orElseThrow(
//                        () -> new EntityNotFoundException("El Departamento con ID " + userDTO.getDepartamentoAdministracionId() + " para el usuario " + userDTO.getNombre()  + "no fue encontrado.")
//                );

//        CarreraEntity carreraComoComision = carreraRepository.findById(userDTO.getCarreraComoComisionId())
//                .orElseThrow(
//                        () -> new EntityNotFoundException("La Carrera como Comisión con ID " + userDTO.getCarreraComoComisionId() + " para el usuario " + userDTO.getNombre()  + "no fue encontrado.")
//                );
//
//        CarreraEntity carreraComoProfesor = carreraRepository.findById(userDTO.getCarreraComoProfesorId())
//                .orElseThrow(
//                        () -> new EntityNotFoundException("La Carrera como Profesor con ID " + userDTO.getCarreraComoProfesorId() + " para el usuario " + userDTO.getNombre()  + "no fue encontrado.")
//                );



//        userEntity.setDepartamentoAdministracion(departamento);
//        userEntity.setCarreraComoComision(carreraComoComision);
//        userEntity.setCarreraComoProfesor(carreraComoProfesor);

        userEntity.setPassword("test");
        UserEntity createdUserEntity = userRepository.save(userEntity);

        return userMapper.toDTO(createdUserEntity);
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        UserEntity foundUser = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existente"));;

        return userMapper.toDTO(foundUser);
    }

    @Override
    public List<UserResponseDTO> listUsers() {
        List<UserEntity> users = userRepository.findAll();
        return users.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> listProfesores() {
        List<UserEntity> profesores = userRepository.findAllByRoles(Rol.PROFESOR);

        return profesores.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> listAdministrativos() {
        List<UserEntity> administrativos = userRepository.findAllByRoles(Rol.ADMINISTRATIVO);

        return administrativos.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> listCoordinadores() {
        List<UserEntity> coordinadores = userRepository.findAllByRoles(Rol.COORDINADOR);

        return coordinadores.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> listSecretarios() {
        List<UserEntity> secretarios = userRepository.findAllByRoles(Rol.SECRETARIO);

        return secretarios.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    public UserResponseDTO updateUser(Long id, UserCreateDTO userDTO) {
        if(!userRepository.existsById(id)) {
            throw new EntityNotFoundException("El usuario con ID " + id + " no fue encontrado.");
        }

        UserEntity userEntity = userMapper.toEntity(userDTO);
        UserEntity savedUserEntity = userRepository.save(userEntity);

        return userMapper.toDTO(savedUserEntity);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

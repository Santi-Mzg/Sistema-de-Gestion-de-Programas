package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth.RegisterRequest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UsuarioDepartamentoService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UsuarioDepartamentoService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.PasswordGeneratorService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.UserMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UserService;

import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UsuarioDepartamentoService userDptoService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordGeneratorService passwordGeneratorService;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository,
                           UsuarioDepartamentoService userDptoService,
                           PasswordEncoder passwordEncoder,
                           PasswordGeneratorService passwordGeneratorService,
                           UserMapper userMapper) {

        this.userRepository = userRepository;
        this.userDptoService = userDptoService;
        this.passwordEncoder = passwordEncoder;
        this.passwordGeneratorService = passwordGeneratorService;
        this.userMapper = userMapper;
    }


    @Override
    public UserResponseDTO createUser(UserCreateDTO userDTO){
        UserEntity user;

        if (userRepository.existsByLegajo(userDTO.getLegajo())) { // Si existe lo busco

            user = userRepository.findByLegajo(userDTO.getLegajo())
                    .orElseThrow(() -> new EntityNotFoundException("El usuario con legajo " + userDTO.getLegajo()  + "no fue encontrado."));


            boolean userInDpto = user.getDepartamentos().stream()
                    .anyMatch(ude -> ude.getDepartamento().getId()
                                    .equals(userDTO.getDepartamentoId())
                    );

            if(userInDpto) { // Si ya tiene un ude de ese departamento retorno
                throw new IllegalArgumentException("Usuario ya registrado en el departamento indicado");
            }

        } else { // Si no existe lo creo

            user = new UserEntity();
            user.setNombre(userDTO.getNombre());
            user.setApellido(userDTO.getApellido());
            user.setLegajo(userDTO.getLegajo());

            String temporaryPassword = passwordGeneratorService.generateSafePassword(12);
            user.setPassword(passwordEncoder.encode(temporaryPassword));
        }

        // De todas maneras creo el ude acorde al departamento
        DepartamentoEntity departamento = userDptoService.getDeptEntityById(userDTO.getDepartamentoId());

        UsuarioDepartamentoEntity ude = new UsuarioDepartamentoEntity();
        ude.setUsuario(user);
        ude.setDepartamento(departamento);
        ude.setEmail(userDTO.getEmail());
        ude.setRoles(userDTO.getRoles());
        user.getDepartamentos().add(ude);

        UserEntity savedUser = userRepository.save(user);

        return userMapper.toDTO(savedUser);

    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        UserEntity foundUser = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existente"));

        return userMapper.toDTO(foundUser);
    }

    @Override
    public UserResponseDTO getUserByLegajo(String legajo) {
        UserEntity foundUser = userRepository.findByLegajo(legajo)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existente"));

        return userMapper.toDTO(foundUser);
    }

    @Override
    public UserEntity getEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existente"));
    }

    @Override
    public UserEntity getEntityByLegajo(String legajo) {
        return userRepository.findByLegajo(legajo)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existente"));
    }

    @Override
    public List<UserResponseDTO> listUsers() {
        List<UserEntity> users = userRepository.findAll();
        return users.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

//    @Override
//    public List<UserResponseDTO> listProfesores() {
//        List<UserEntity> profesores = userRepository.findAllByRoles(Rol.PROFESOR);
//
//        return profesores.stream()
//                .map(userMapper::toDTO)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public List<UserResponseDTO> listAdministrativos() {
//        List<UserEntity> administrativos = userRepository.findAllByRoles(Rol.ADMINISTRATIVO);
//
//        return administrativos.stream()
//                .map(userMapper::toDTO)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public List<UserResponseDTO> listCoordinadores() {
//        List<UserEntity> coordinadores = userRepository.findAllByRoles(Rol.COORDINACION_COMISION_CURRICULAR);
//
//        return coordinadores.stream()
//                .map(userMapper::toDTO)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public List<UserResponseDTO> listSecretarios() {
//        List<UserEntity> secretarios = userRepository.findAllByRoles(Rol.SECRETARIA);
//
//        return secretarios.stream()
//                .map(userMapper::toDTO)
//                .collect(Collectors.toList());
//    }


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

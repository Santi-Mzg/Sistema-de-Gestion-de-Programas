package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UsuarioDepartamentoService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.PasswordGeneratorService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.UserMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UserService;

import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UsuarioDepartamentoService userDptoService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordGeneratorService passwordGeneratorService;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository,
                           UsuarioDepartamentoService userDptoService,
                           EmailService emailService,
                           PasswordEncoder passwordEncoder,
                           PasswordGeneratorService passwordGeneratorService,
                           UserMapper userMapper) {

        this.userRepository = userRepository;
        this.userDptoService = userDptoService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.passwordGeneratorService = passwordGeneratorService;
        this.userMapper = userMapper;
    }


    @Override
    @Transactional
    public UserResponseDTO createUser(Long deptId, UserCreateDTO userDTO){
        UserEntity user;
        String temporaryPassword = null;
        boolean nuevoUsuario = false;

        Optional<UserEntity> existingUser = userRepository.findByLegajoWithDepartamentos(userDTO.getLegajo());

        if (existingUser.isPresent()) { // Si existe lo busco
            user = existingUser.get();

            boolean userInDpto = user.getDepartamentos().stream()
                    .anyMatch(ude -> ude.getDepartamento().getId().equals(deptId));

            if(userInDpto) { // Si ya tiene un ude de ese departamento retorno
                throw new IllegalArgumentException("Usuario ya registrado en el departamento indicado");
            }

        } else { // Si no existe lo creo

            user = new UserEntity();
            user.setNombre(userDTO.getNombre());
            user.setApellido(userDTO.getApellido());
            user.setLegajo(userDTO.getLegajo());

            temporaryPassword = passwordGeneratorService.generateSafePassword(16);
            user.setPassword(passwordEncoder.encode(temporaryPassword));

            nuevoUsuario = true;
        }

        // De todas maneras creo el ude acorde al departamento
        DepartamentoEntity departamento = userDptoService.getDeptEntityById(deptId);

        UsuarioDepartamentoEntity ude = new UsuarioDepartamentoEntity();
        ude.setUsuario(user);
        ude.setDepartamento(departamento);
        ude.setEmail(userDTO.getEmail());
        ude.setRoles(userDTO.getRoles());
        user.getDepartamentos().add(ude);


        UserEntity savedUser = userRepository.save(user);

        try {
            if(nuevoUsuario)
                emailService.sendEmailNuevoUsuario(userDTO.getEmail(), userDTO.getLegajo(), temporaryPassword);
            else
                emailService.sendEmailNuevoDepartamento(userDTO.getEmail(), departamento.getNombre());
        } catch (Exception e) {
            throw new RuntimeException("Error al notificar al usuario, pero la cuenta fue creada: "+e);
        }

        return userMapper.toDTO(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        UserEntity foundUser = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existente"));

        return userMapper.toDTO(foundUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserByLegajo(String legajo) {
        UserEntity foundUser = userRepository.findByLegajoWithDepartamentos(legajo)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existente"));

        return userMapper.toDTO(foundUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserEntity getEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existente"));
    }

    @Override
    @Transactional(readOnly = true)
    public UserEntity getEntityByLegajo(String legajo) {
        return userRepository.findByLegajo(legajo)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existente"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> listUsers() {
        List<UserEntity> users = userRepository.findAll();
        return users.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> listUsersDepartamento(Long deptId, UserEntity auth) {
        List<UserResponseDTO> userList = userDptoService.findFullByDepartamentoId(deptId)
                        .stream()
                        .map(UsuarioDepartamentoEntity::getUsuario)
                        .map(userMapper::toDTO)
                        .toList();

        if(!auth.isAdmin()) {
            return userList.stream().filter(usuario -> !usuario.isAdmin())
                    .toList();
        }

        return userList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> listDocentesDepartamento(Long deptId, UserEntity auth) {
        List<UserResponseDTO> userList = userDptoService.findFullByDepartamentoId(deptId)
                .stream()
                .filter(ude -> ude.hasRole(Rol.DOCENTE))
                .map(UsuarioDepartamentoEntity::getUsuario)
                .map(userMapper::toDTO)
                .toList();

        if(!auth.isAdmin()) {
            return userList.stream().filter(usuario -> !usuario.isAdmin())
                    .toList();
        }

        return userList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> listAdministrativosDepartamento(Long deptId, UserEntity auth) {
        List<UserResponseDTO> userList = userDptoService.findFullByDepartamentoId(deptId)
                .stream()
                .filter(ude -> ude.hasRole(Rol.ADMINISTRACION))
                .map(UsuarioDepartamentoEntity::getUsuario)
                .map(userMapper::toDTO)
                .toList();

        if(!auth.isAdmin()) {
            return userList.stream().filter(usuario -> !usuario.isAdmin())
                    .toList();
        }

        return userList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> listSecretariosDepartamento(Long deptId, UserEntity auth) {
        List<UserResponseDTO> userList = userDptoService.findFullByDepartamentoId(deptId)
                .stream()
                .filter(ude -> ude.hasRole(Rol.SECRETARIA))
                .map(UsuarioDepartamentoEntity::getUsuario)
                .map(userMapper::toDTO)
                .toList();

        if(!auth.isAdmin()) {
            return userList.stream().filter(usuario -> !usuario.isAdmin())
                    .toList();
        }

        return userList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> listCoordinadoresDepartamento(Long deptId, UserEntity auth) {
        List<UserResponseDTO> userList = userDptoService.findFullByDepartamentoId(deptId)
                .stream()
                .filter(ude -> ude.hasRole(Rol.COORDINACION_COMISION_CURRICULAR))
                .map(UsuarioDepartamentoEntity::getUsuario)
                .map(userMapper::toDTO)
                .toList();

        if(!auth.isAdmin()) {
            return userList.stream().filter(usuario -> !usuario.isAdmin())
                    .toList();
        }

        return userList;
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, Long deptId, UserCreateDTO userDTO) {
        return userRepository.findById(id).map(existingUser -> {
            Optional.ofNullable(userDTO.getNombre()).ifPresent(existingUser::setNombre);
            Optional.ofNullable(userDTO.getApellido()).ifPresent(existingUser::setApellido);
            Optional.ofNullable(userDTO.getLegajo()).ifPresent(existingUser::setLegajo);
            Optional.ofNullable(userDTO.getEmail()).ifPresent(email -> {
                UsuarioDepartamentoEntity ude = userDptoService.findByUsuarioIdAndDepartamentoId(id, deptId);
                ude.setEmail(email);
            });

            UserEntity savedUserEntity = userRepository.save(existingUser);

            return userMapper.toDTO(savedUserEntity);
        }).orElseThrow(() -> new EntityNotFoundException("Usuario no existente"));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

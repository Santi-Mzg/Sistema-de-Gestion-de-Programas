package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.TokenType;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.PasswordTokenRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UsuarioDepartamentoService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.auth.AuthService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.UserMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UserService;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordTokenRepository tokenRepository;
    private final AuthService authService;
    private final UsuarioDepartamentoService userDptoService;
    private final EmailService emailService;
    private final ProgramaService programaService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;


    public UserServiceImpl(UserRepository userRepository,
                           PasswordTokenRepository tokenRepository,
                           AuthService authService,
                           UsuarioDepartamentoService userDptoService,
                           EmailService emailService,
                           ProgramaService programaService,
                           UserMapper userMapper,
                           PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.authService = authService;
        this.userDptoService = userDptoService;
        this.emailService = emailService;
        this.programaService = programaService;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }


    @Override
    @Transactional
    public UserResponseDTO createUser(Long deptId, UserCreateDTO userDTO){
        UserEntity user;
        boolean nuevoUsuario = false;

        DepartamentoEntity departamento = userDptoService.getDeptEntityById(deptId);
        Optional<UserEntity> existingUser = userRepository.findByLegajo(userDTO.getLegajo());


        if (existingUser.isPresent()) { // Si existe lo busco
            user = existingUser.get();
            Optional<UsuarioDepartamentoEntity> existingUDE = userDptoService.findByUsuarioLegajoAndDepartamentoIdOptional(userDTO.getLegajo(), deptId);

            if(existingUDE.isPresent()) { // Existe y ademas esta/estuvo en el depa
                UsuarioDepartamentoEntity ude = existingUDE.get();

                if(ude.isActivo()) { // Esta activo
                    throw new IllegalArgumentException("Usuario ya registrado en el departamento indicado");
                }

                // Sino lo reactivamos
                ude.setActivo(true);
                ude.setFechaBaja(null);
                ude.setFechaAlta(LocalDateTime.now());
                ude.setEmail(userDTO.getEmail());
                ude.setRoles(userDTO.getRoles());
                user.setEnabled(true);

            } else { // Existe pero nunca pertenecio al departamento

                UsuarioDepartamentoEntity ude = crearUsuarioDepartamento(user, departamento, userDTO);

                user.getDepartamentos().add(ude);
                user.setEnabled(true);
            }

        } else { // Si no existe lo creo y lo agrego al departamento

            user = new UserEntity();

            user.setNombre(userDTO.getNombre());
            user.setApellido(userDTO.getApellido());
            user.setLegajo(userDTO.getLegajo());
            user.setEnabled(false);

            UsuarioDepartamentoEntity ude = crearUsuarioDepartamento(user, departamento, userDTO);
            user.getDepartamentos().add(ude);

            nuevoUsuario = true;
        }

        UserEntity savedUser = userRepository.save(user);


        try {
            if(nuevoUsuario) { // Si es nuevo le creo token para actualizar contraseña
                PasswordTokenEntity token = new PasswordTokenEntity();
                token.setUser(savedUser);
                String rawToken = authService.generateRawToken();
                String hashedToken = DigestUtils.sha256Hex(rawToken);
                token.setTokenHash(hashedToken);
                token.setType(TokenType.SET_PASSWORD);
                token.setCreatedAt(LocalDateTime.now());
                token.setExpiresAt(LocalDateTime.now().plusHours(1));
                token.setUsed(false);

                tokenRepository.save(token);

                emailService.sendEmailNuevoUsuario(userDTO.getEmail(), rawToken);
            }
            else {
                emailService.sendEmailNuevoDepartamento(userDTO.getEmail(), departamento.getNombre());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al notificar al usuario, pero la cuenta fue creada: "+e);
        }

        return userMapper.toDTO(savedUser);
    }

    private UsuarioDepartamentoEntity crearUsuarioDepartamento(
            UserEntity user,
            DepartamentoEntity departamento,
            UserCreateDTO userDTO
    ) {
        UsuarioDepartamentoEntity ude =
                new UsuarioDepartamentoEntity();

        ude.setUsuario(user);
        ude.setDepartamento(departamento);
        ude.setEmail(userDTO.getEmail());
        ude.setRoles(userDTO.getRoles());

        ude.setActivo(true);
        ude.setFechaAlta(LocalDateTime.now());
        ude.setFechaBaja(null);

        return ude;
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
        UserEntity foundUser = userRepository.findByLegajoWithDepartamentosActivos(legajo)
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
    public Page<UserResponseDTO> listUsersDepartamento(Long deptId, UserEntity auth, String search, Pageable pageable) {
        String normalizedSearch =
                search == null || search.isBlank()
                        ? ""
                        : search.trim();

        return userRepository.findAllByDepartamentoId(deptId, normalizedSearch, auth.isAdmin(), pageable)
                        .map(userMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> listDocentesDepartamento(Long deptId, UserEntity auth) {
        List<UserResponseDTO> userList = userDptoService.findFullByDepartamentoId(deptId)
                .stream()
                .filter(ude -> ude.isActivo() && ude.hasRole(Rol.DOCENTE))
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
                if (!ude.isActivo()) {
                    throw new IllegalStateException("El usuario no se encuentra activo en el departamento");
                }
                ude.setEmail(email);
            });
            Optional.ofNullable(userDTO.getPassword()).ifPresent( password -> {
                existingUser.setPassword(passwordEncoder.encode(password));
            });

            UserEntity savedUserEntity = userRepository.save(existingUser);

            return userMapper.toDTO(savedUserEntity);
        }).orElseThrow(() -> new EntityNotFoundException("Usuario no existente"));
    }

    @Override
    @Transactional
    public void deleteUserFromDepartamento(Long id, Long deptId) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no existente"));

        UsuarioDepartamentoEntity ude =
                userDptoService.findByUsuarioIdAndDepartamentoId(id, deptId);

        if (!ude.isActivo()) {
            throw new IllegalStateException(
                    "El usuario ya se encuentra inactivo en el departamento"
            );
        }

        validarQuePuedeDarseDeBaja(ude);

        // Baja lógica del usuario dentro del departamento
        ude.setActivo(false);
        ude.setFechaBaja(LocalDateTime.now());

        // Evita que conserve permisos operativos
        ude.getRoles().clear();

        userDptoService.save(ude);

        // Si ya no pertenece activamente a ningún departamento,
        // se deshabilita también la cuenta global.
        boolean tieneDepartamentosActivos =
                user.getDepartamentos().stream()
                        .anyMatch(UsuarioDepartamentoEntity::isActivo);

        if (!tieneDepartamentosActivos) {
            user.setEnabled(false);
            userRepository.save(user);
        }

    }

    private void validarQuePuedeDarseDeBaja(
            UsuarioDepartamentoEntity ude
    ) {
        if (!ude.getCarrerasComoComision().isEmpty()) {
            throw new IllegalStateException(
                    "No se puede dar de baja al usuario porque coordina una o más carreras"
            );
        }

        if (ude.getRoles().contains(Rol.SECRETARIA)) {
            throw new IllegalStateException(
                    "No se puede dar de baja al usuario porque actualmente ocupa el cargo de Secretaría Académica"
            );
        }

        if (ude.getRoles().contains(Rol.DIRECCION_ADMINISTRATIVA)) {
            throw new IllegalStateException(
                    "No se puede dar de baja al usuario porque actualmente ocupa el cargo de Dirección Administrativa"
            );
        }

        if (ude.getRoles().contains(Rol.SYSTEM_ADMIN)) {
            throw new IllegalStateException(
                    "No se puede dar de baja al usuario porque es un Administrador del Sistema"
            );
        }

        if (programaService.tieneProgramasActivosComoDocente(ude)) {
            throw new IllegalStateException(
                    "No se puede dar de baja al usuario porque posee programas activos como docente responsable"
            );
        }
    }
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;

import java.util.List;


public interface UserService {
    UserResponseDTO createUser(Long deptId, UserCreateDTO user);
    UserResponseDTO getUserById(Long id);
    UserResponseDTO getUserByLegajo(String legajo);
    UserEntity getEntityById(Long id);
    UserEntity getEntityByLegajo(String legajo);
    List<UserResponseDTO> listUsers();
    List<UserResponseDTO> listUsersDepartamento(Long id, UserEntity auth);
    List<UserResponseDTO> listDocentesDepartamento(Long deptId, UserEntity auth);
    List<UserResponseDTO> listAdministrativosDepartamento(Long deptId, UserEntity auth);
    List<UserResponseDTO> listSecretariosDepartamento(Long deptId, UserEntity auth);
    List<UserResponseDTO> listCoordinadoresDepartamento(Long deptId, UserEntity auth);
    UserResponseDTO updateUser(Long id, UserCreateDTO user);
    void deleteUser(Long id);
}

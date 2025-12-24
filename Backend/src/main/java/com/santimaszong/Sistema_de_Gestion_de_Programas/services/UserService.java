package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;

import java.util.List;


public interface UserService {
    UserResponseDTO createUser(UserCreateDTO user);
    UserResponseDTO getUserById(Long id);
    UserResponseDTO getUserByLegajo(String legajo);
    UserEntity getEntityById(Long id);
    UserEntity getEntityByLegajo(String legajo);
    List<UserResponseDTO> listUsers();
//    List<UserResponseDTO> listProfesores();
//    List<UserResponseDTO> listAdministrativos();
//    List<UserResponseDTO> listSecretarios();
//    List<UserResponseDTO> listCoordinadores();
    UserResponseDTO updateUser(Long id, UserCreateDTO user);
    void deleteUser(Long id);
}

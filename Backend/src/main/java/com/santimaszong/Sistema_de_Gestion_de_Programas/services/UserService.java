package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;


public interface UserService {
    UserResponseDTO createUser(UserCreateDTO user);
    UserResponseDTO getUserById(Long id);
//    List<UserResponseDTO> listUsers();
//    List<UserResponseDTO> listProfesores();
//    List<UserResponseDTO> listAdministrativos();
//    List<UserResponseDTO> listSecretarios();
//    List<UserResponseDTO> listCoordinadores();
    UserResponseDTO updateUser(Long id, UserCreateDTO user);
    void deleteUser(Long id);
}

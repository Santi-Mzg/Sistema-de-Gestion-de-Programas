package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.UserDTO;

import java.util.List;
import java.util.Optional;

public interface UserService {
    UserDTO createUser(UserDTO user) throws Exception;
    Optional<UserDTO> getUserById(Long id);
    List<UserDTO> listUsers();
    UserDTO updateUser(Long id, UserDTO user);
    void deleteUser(Long id);
}

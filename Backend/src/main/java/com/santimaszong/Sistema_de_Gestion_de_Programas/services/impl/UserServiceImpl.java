package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.UserDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private Mapper<UserDTO, UserEntity> userMapper;

    public UserServiceImpl(UserRepository userRepository, Mapper<UserDTO, UserEntity> userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }


    @Override
    public UserDTO createUser(UserDTO userDTO) throws Exception{
        UserEntity userEntity = userMapper.mapTo(userDTO);
        UserEntity createdUserEntity = userRepository.save(userEntity);

//        if(createdUserEntity==null)
//            throw new Exception("Error al crear el usuario.");

        return userMapper.mapFrom(createdUserEntity);
    }

    @Override
    public Optional<UserDTO> getUserById(Long id) {
        Optional<UserEntity> foundUser = userRepository.findById(id);

        return foundUser.map(userMapper::mapFrom);
    }

    @Override
    public List<UserDTO> listUsers() {
        List<UserEntity> users = userRepository.findAll();
        return users.stream()
                .map(userMapper::mapFrom)
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        if(!userRepository.existsById(id)) {
            throw new EntityNotFoundException("La entidad con ID " + id + " no fue encontrada.");
        }

        UserEntity userEntity = userMapper.mapTo(userDTO);
        UserEntity savedUserEntity = userRepository.save(userEntity);

        return userMapper.mapFrom(savedUserEntity);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

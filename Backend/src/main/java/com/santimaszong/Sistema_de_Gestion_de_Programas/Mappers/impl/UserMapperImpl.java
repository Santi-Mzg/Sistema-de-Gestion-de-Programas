package com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.UserDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class UserMapperImpl implements Mapper<UserDTO, UserEntity> {

    private ModelMapper modelMapper;

    public UserMapperImpl(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public UserEntity mapTo(UserDTO userDTO) {
        UserEntity userEntity = new UserEntity();
        userEntity.setId(userDTO.getId());
        userEntity.setNombre(userDTO.getNombre());
        userEntity.setApellido(userDTO.getApellido());
        userEntity.setLegajo(userDTO.getLegajo());
        userEntity.setDepartamento(userDTO.getDepartamento());
        userEntity.setRol(userDTO.getRol());
        return userEntity;
//        return modelMapper.map(userDTO, UserEntity.class);
    }

    @Override
    public UserDTO mapFrom(UserEntity userEntity) {
//        UserDTO userDTO = new UserDTO();
//        userDTO.setId(userEntity.getId());
//        userDTO.setNombre(userEntity.getNombre());
//        userDTO.setApellido(userEntity.getApellido());
//        userDTO.setLegajo(userEntity.getLegajo());
//        userDTO.setDepartamento(userEntity.getDepartamento());
//        userDTO.setRol(userEntity.getRol());
//        return userDTO;
        return new UserDTO(
                userEntity.getId(),
                userEntity.getNombre(),
                userEntity.getApellido(),
                userEntity.getLegajo(),
                userEntity.getDepartamento(),
                userEntity.getRol()
        );
//        return modelMapper.map(userEntity, UserDTO.class);
    }
}

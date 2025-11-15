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
        return modelMapper.map(userDTO, UserEntity.class);
    }

    @Override
    public UserDTO mapFrom(UserEntity userEntity) {
        return modelMapper.map(userEntity, UserDTO.class);
    }
}

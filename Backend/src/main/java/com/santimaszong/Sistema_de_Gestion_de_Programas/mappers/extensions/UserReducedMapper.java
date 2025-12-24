package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseReducedDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserReducedMapper extends ToDTOMapper<UserEntity, UserResponseReducedDTO> {

    @Override
    UserResponseReducedDTO toDTO(UserEntity user);

}

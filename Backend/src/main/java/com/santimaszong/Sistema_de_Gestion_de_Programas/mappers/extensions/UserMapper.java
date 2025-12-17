package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(
        componentModel = "spring",
        uses = {
                UsuarioDepartamentoMapper.class,
        }
)
public interface UserMapper extends ToEntityMapper<UserCreateDTO, UserEntity>, ToDTOMapper<UserEntity, UserResponseDTO> {


    @Override
    @Mapping(target = "id", ignore = true)
    UserEntity toEntity(UserCreateDTO dto);

    @Override
    @Mapping(source = "departamentos", target = "departamentos")
    UserResponseDTO toDTO(UserEntity user);

}

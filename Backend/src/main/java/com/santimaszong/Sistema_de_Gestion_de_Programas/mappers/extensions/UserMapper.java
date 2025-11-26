package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper extends ToEntityMapper<UserCreateDTO, UserEntity>, ToDTOMapper<UserEntity, UserResponseDTO> {


    @Override
    @Mapping(target = "id", ignore = true)
//    @Mapping(target = "departamentoAdministracion", ignore = true)
//    @Mapping(target = "carreraComoComision", ignore = true)
//    @Mapping(target = "carreraComoProfesor", ignore = true)
    UserEntity toEntity(UserCreateDTO dto);

    @Override
//    @Mapping(source = "departamentoAdministracion", target = "departamentoAdministracion")
//    @Mapping(source = "carreraComoComision", target = "carreraComoComision")
//    @Mapping(source = "carreraComoProfesor", target = "carreraComoProfesor")
    UserResponseDTO toDTO(UserEntity user);


}

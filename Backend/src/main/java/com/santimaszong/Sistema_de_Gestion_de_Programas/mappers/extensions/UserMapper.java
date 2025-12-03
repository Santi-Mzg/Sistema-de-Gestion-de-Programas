package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils.CarreraToStringMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils.DepartamentoToStringMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils.MateriasToStringMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                DepartamentoToStringMapper.class,
                CarreraToStringMapper.class,
                MateriasToStringMapper.class
        }
)
public interface UserMapper extends ToEntityMapper<UserCreateDTO, UserEntity>, ToDTOMapper<UserEntity, UserResponseDTO> {


    @Override
    @Mapping(target = "id", ignore = true)
//    @Mapping(target = "departamentoAdministracion", ignore = true)
//    @Mapping(target = "carreraComoComision", ignore = true)
//    @Mapping(target = "carreraComoProfesor", ignore = true)
    UserEntity toEntity(UserCreateDTO dto);

    @Override
    @Mapping(source = "departamentoAdministracion", target = "departamentoAdministracion", qualifiedByName = "departamentoToString")
    @Mapping(source = "departamentoSecretaria", target = "departamentoSecretaria", qualifiedByName = "departamentoToString")
    @Mapping(source = "carreraComoComision", target = "carreraComoComision", qualifiedByName = "carreraToString")
    @Mapping(source = "carreraComoProfesor", target = "carreraComoProfesor", qualifiedByName = "carreraToString")
    @Mapping(source = "materiasComoProfesor", target = "materiasComoProfesor", qualifiedByName = "programasToString")
    UserResponseDTO toDTO(UserEntity user);

}

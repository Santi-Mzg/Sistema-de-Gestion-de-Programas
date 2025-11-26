package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;


import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProgramaResponseMapper extends ToDTOMapper<ProgramaEntity, ProgramaResponseDTO> {

    default String map(UserEntity profesor) {
        return profesor.getApellido() + profesor.getNombre();
    }

    @Override
    @Mapping(source = "carreras", target = "carreras")
    @Mapping(source = "historialEstados", target = "historialEstados")
    ProgramaResponseDTO toDTO(ProgramaEntity entity);
}
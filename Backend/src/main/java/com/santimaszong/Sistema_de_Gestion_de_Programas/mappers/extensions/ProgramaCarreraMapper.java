package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;


import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCarreraCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaCarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProgramaCarreraMapper extends ToEntityMapper<ProgramaCarreraCreateDTO, ProgramaCarreraEntity>, ToDTOMapper<ProgramaCarreraEntity, ProgramaCarreraResponseDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carrera", ignore = true)
    @Mapping(target = "correlativasDebiles", ignore = true)
    @Mapping(target = "correlativasFuertes", ignore = true)
    ProgramaCarreraEntity toEntity(ProgramaCarreraCreateDTO dto);

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carrera", ignore = true)
    @Mapping(target = "correlativasDebiles", ignore = true)
    @Mapping(target = "correlativasFuertes", ignore = true)
    List<ProgramaCarreraEntity> toEntityList(List<ProgramaCarreraCreateDTO> dtoList);

    @Override
    @Mapping(source = "carrera", target = "carrera")
    @Mapping(source = "correlativasDebiles", target = "correlativasDebiles")
    @Mapping(source = "correlativasFuertes", target = "correlativasFuertes")
    ProgramaCarreraResponseDTO toDTO(ProgramaCarreraEntity entity);
}
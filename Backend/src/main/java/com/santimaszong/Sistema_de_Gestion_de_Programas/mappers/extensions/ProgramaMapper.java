package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;


import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProgramaMapper extends ToEntityMapper<ProgramaCreateDTO, ProgramaEntity>, ToDTOMapper<ProgramaEntity, ProgramaResponseDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
//    @Mapping(target = "correlativasFuertes", ignore = true)
    ProgramaEntity toEntity(ProgramaCreateDTO dto);

    @Override
//    @Mapping(source = "requierenComoDebil", target = "requierenComoDebil")
    ProgramaResponseDTO toDTO(ProgramaEntity entity);
}
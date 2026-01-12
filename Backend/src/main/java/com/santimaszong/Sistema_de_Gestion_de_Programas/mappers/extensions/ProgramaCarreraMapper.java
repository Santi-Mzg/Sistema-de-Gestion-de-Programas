package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCarreraCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaCarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {
                CarreraPlanMapper.class,
                MateriaReducedMapper.class
        }
)
public interface ProgramaCarreraMapper extends ToEntityMapper<ProgramaCarreraCreateDTO, ProgramaCarreraEntity>, ToDTOMapper<ProgramaCarreraEntity, ProgramaCarreraResponseDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carreraPlan", ignore = true)
    @Mapping(target = "programa", ignore = true)
    @Mapping(target = "correlativasDebiles", ignore = true)
    @Mapping(target = "correlativasFuertes", ignore = true)
    ProgramaCarreraEntity toEntity(ProgramaCarreraCreateDTO dto);

    @Override
    @Mapping(source = "carreraPlan.carrera.nombre", target = "carreraNombre")
    @Mapping(source = "carreraPlan", target = "plan")
    @Mapping(source = "ubicacionEnPlan", target = "ubicacionEnPlan")
    @Mapping(source = "correlativasFuertes", target = "correlativasFuertes")
    @Mapping(source = "correlativasDebiles", target = "correlativasDebiles")
    @Mapping(source = "contribucion", target = "contribucion")
    @Mapping(source = "contenidosMinimos", target = "contenidosMinimos")
    @Mapping(target = "key", ignore = true)
    ProgramaCarreraResponseDTO toDTO(ProgramaCarreraEntity entity);

}
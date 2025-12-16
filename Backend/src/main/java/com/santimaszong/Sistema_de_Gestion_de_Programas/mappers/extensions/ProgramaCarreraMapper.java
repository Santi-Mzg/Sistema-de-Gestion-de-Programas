package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCarreraDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaCarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils.MateriasToStringMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {
                MateriasToStringMapper.class,
        }
)
public interface ProgramaCarreraMapper extends ToEntityMapper<ProgramaCarreraDTO, ProgramaCarreraEntity>, ToDTOMapper<ProgramaCarreraEntity, ProgramaCarreraDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carrera", ignore = true)
    @Mapping(target = "programa", ignore = true)
    @Mapping(target = "correlativasDebiles", ignore = true)
    @Mapping(target = "correlativasFuertes", ignore = true)
    ProgramaCarreraEntity toEntity(ProgramaCarreraDTO dto);

    @Override
    @Mapping(source = "carrera.id", target = "carreraId")
    @Mapping(source = "plan", target = "plan")
    @Mapping(source = "ubicacionEnPlan", target = "ubicacionEnPlan")
    @Mapping(source = "correlativasFuertes", target = "correlativasFuertesIds", qualifiedByName = "materiasToString")
    @Mapping(source = "correlativasDebiles", target = "correlativasDebilesIds", qualifiedByName = "materiasToString")
    @Mapping(source = "contribucion", target = "contribucion")
    @Mapping(source = "contenidosMinimos", target = "contenidosMinimos")
    @Mapping(target = "key", ignore = true)
    ProgramaCarreraDTO toDTO(ProgramaCarreraEntity entity);

}
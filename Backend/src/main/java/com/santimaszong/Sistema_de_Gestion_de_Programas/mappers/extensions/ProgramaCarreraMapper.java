package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCarreraCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaCarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils.CarreraToStringMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils.MateriasToStringMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                MateriasToStringMapper.class,
                CarreraToStringMapper.class
        }
)
public interface ProgramaCarreraMapper extends ToEntityMapper<ProgramaCarreraCreateDTO, ProgramaCarreraEntity>, ToDTOMapper<ProgramaCarreraEntity, ProgramaCarreraResponseDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carrera", ignore = true)
    @Mapping(target = "correlativasDebiles", ignore = true)
    @Mapping(target = "correlativasFuertes", ignore = true)
    ProgramaCarreraEntity toEntity(ProgramaCarreraCreateDTO dto);

    @Override
    @Mapping(source = "carrera", target = "carrera", qualifiedByName = "carreraToString")
    @Mapping(source = "plan", target = "plan")
    @Mapping(source = "ubicacionEnPlan", target = "ubicacionEnPlan")
    @Mapping(source = "correlativasFuertes", target = "correlativasFuertes", qualifiedByName = "materiasToString")
    @Mapping(source = "correlativasDebiles", target = "correlativasDebiles", qualifiedByName = "materiasToString")
    @Mapping(source = "contribucion", target = "contribucion")
    @Mapping(source = "contenidosMinimos", target = "contenidosMinimos")
    ProgramaCarreraResponseDTO toDTO(ProgramaCarreraEntity entity);

}
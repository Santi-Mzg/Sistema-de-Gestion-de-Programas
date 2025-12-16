package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.AreaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AreaMapper extends ToEntityMapper<AreaCreateDTO, AreaEntity>, ToDTOMapper<AreaEntity, AreaResponseDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "departamento", ignore = true)
    @Mapping(target = "materias", ignore = true)
    AreaEntity toEntity(AreaCreateDTO dto);

    @Override
    AreaResponseDTO toDTO(AreaEntity entity);
}

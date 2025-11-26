package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MateriaMapper extends ToEntityMapper<MateriaCreateDTO, MateriaEntity>, ToDTOMapper<MateriaEntity, MateriaResponseDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    MateriaEntity toEntity(MateriaCreateDTO dto);

    @Override
    MateriaResponseDTO toDTO(MateriaEntity entity);
}

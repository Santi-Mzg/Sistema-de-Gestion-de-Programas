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
    @Mapping(target = "area", ignore = true)
    @Mapping(target = "departamento", ignore = true)
    @Mapping(target = "programas", ignore = true)
    @Mapping(target = "requierenComoFuerte", ignore = true)
    @Mapping(target = "requierenComoDebil", ignore = true)
    MateriaEntity toEntity(MateriaCreateDTO dto);

    @Override
    @Mapping(source = "departamento.nombre", target = "departamento")
    @Mapping(source = "area.nombre", target = "area")
    MateriaResponseDTO toDTO(MateriaEntity entity);
}

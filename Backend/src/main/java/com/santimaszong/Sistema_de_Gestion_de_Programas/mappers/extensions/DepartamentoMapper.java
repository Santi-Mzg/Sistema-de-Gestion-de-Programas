package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DepartamentoMapper extends ToEntityMapper<DepartamentoCreateDTO, DepartamentoEntity>, ToDTOMapper<DepartamentoEntity, DepartamentoResponseDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "administracion", ignore = true)
    @Mapping(target = "secretaria", ignore = true)
    DepartamentoEntity toEntity(DepartamentoCreateDTO dto);

    @Override
    @Mapping(source = "administracion", target = "administracion")
    @Mapping(source = "secretaria", target = "secretaria")
    DepartamentoResponseDTO toDTO(DepartamentoEntity entity);
}

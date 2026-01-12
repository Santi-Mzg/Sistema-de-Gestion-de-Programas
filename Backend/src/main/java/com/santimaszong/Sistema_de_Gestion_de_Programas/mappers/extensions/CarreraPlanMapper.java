package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraPlanCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraPlanResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraPlanEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CarreraPlanMapper extends ToEntityMapper<CarreraPlanCreateDTO, CarreraPlanEntity>, ToDTOMapper<CarreraPlanEntity, CarreraPlanResponseDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carrera", ignore = true)
    @Mapping(target = "materias", ignore = true)
    CarreraPlanEntity toEntity(CarreraPlanCreateDTO dto);

    @Override
    CarreraPlanResponseDTO toDTO(CarreraPlanEntity entity);
}
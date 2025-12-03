package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils.DepartamentoToStringMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils.UserToStringMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {
                ProgramaCarreraMapper.class,
                DepartamentoToStringMapper.class,
                UserToStringMapper.class
        }
)
public interface CarreraMapper extends ToEntityMapper<CarreraCreateDTO, CarreraEntity>, ToDTOMapper<CarreraEntity, CarreraResponseDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "departamento", ignore = true)
    @Mapping(target = "comision", ignore = true)
    CarreraEntity toEntity(CarreraCreateDTO dto);

    @Override
    @Mapping(source = "materias", target = "materias")
    @Mapping(source = "departamento", target = "departamento", qualifiedByName = "departamentoToString")
    @Mapping(source = "comision", target = "comision", qualifiedByName = "userToString")
    CarreraResponseDTO toDTO(CarreraEntity entity);
}
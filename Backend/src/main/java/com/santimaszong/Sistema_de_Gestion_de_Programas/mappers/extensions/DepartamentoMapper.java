package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils.UserToStringMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {
                CarreraMapper.class,
                MateriaMapper.class,
                AreaMapper.class,
                UserReducedMapper.class,
        }
)
public interface DepartamentoMapper extends ToEntityMapper<DepartamentoCreateDTO, DepartamentoEntity>, ToDTOMapper<DepartamentoEntity, DepartamentoResponseDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "areas", ignore = true)
    @Mapping(target = "carreras", ignore = true)
    @Mapping(target = "materias", ignore = true)
    @Mapping(target = "usuarios", ignore = true)
    DepartamentoEntity toEntity(DepartamentoCreateDTO dto);

    @Override
    @Mapping(source = "secretaria", target = "secretaria")
    @Mapping(source = "direccionAdministrativa", target = "direccionAdministrativa")
    DepartamentoResponseDTO toDTO(DepartamentoEntity entity);


}

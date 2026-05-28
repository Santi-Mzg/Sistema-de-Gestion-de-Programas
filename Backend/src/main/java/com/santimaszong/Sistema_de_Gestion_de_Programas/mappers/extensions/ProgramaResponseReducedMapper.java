package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;


import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseReducedDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {
                UserReducedMapper.class,
                MateriaMapper.class
        }
)
public interface ProgramaResponseReducedMapper extends ToDTOMapper<ProgramaEntity, ProgramaResponseReducedDTO> {

    @Override
    @Mapping(source = "materia", target = "materia")
    @Mapping(source = "profesorResponsable.usuario", target = "profesorResponsable")
    @Mapping(source = "estadoActual", target = "estado")
    ProgramaResponseReducedDTO toDTO(ProgramaEntity entity);

}
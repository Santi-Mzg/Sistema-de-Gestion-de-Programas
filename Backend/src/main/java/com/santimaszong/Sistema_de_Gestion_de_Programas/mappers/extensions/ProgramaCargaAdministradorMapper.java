package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;


import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaProfesorDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProgramaMapper extends ToEntityMapper<ProgramaCargaProfesorDTO, ProgramaEntity>, ToDTOMapper<ProgramaEntity, ProgramaResponseDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "materia", ignore = true)
    @Mapping(target = "profesorResponsable", ignore = true)
//    @Mapping(target = "carreras", ignore = true)
    @Mapping(target = "historialEstados", ignore = true)
    ProgramaEntity toEntity(ProgramaCargaProfesorDTO dto);

    @Override
    @Mapping(source = "materia", target = "materia")
    @Mapping(source = "profesorResponsable", target = "profesorResponsable")
//    @Mapping(source = "carreras", target = "carreras")
    @Mapping(source = "historialEstados", target = "historialEstados")
    ProgramaResponseDTO toDTO(ProgramaEntity entity);
}
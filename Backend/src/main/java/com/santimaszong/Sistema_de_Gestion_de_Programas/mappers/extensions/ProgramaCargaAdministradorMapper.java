package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;


import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaAdministrativoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProgramaCargaAdministradorMapper extends ToEntityMapper<ProgramaCargaAdministrativoDTO, ProgramaEntity> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "materia", ignore = true)
    @Mapping(target = "profesorResponsable", ignore = true)
    @Mapping(target = "carreras", ignore = true)
    @Mapping(target = "cargaHorariaPractica", ignore = true)
    @Mapping(target = "fundamentacion", ignore = true)
    @Mapping(target = "objetivos", ignore = true)
    @Mapping(target = "programaAnalitico", ignore = true)
    @Mapping(target = "metodologia", ignore = true)
    @Mapping(target = "modalidadEvaluacion", ignore = true)
    @Mapping(target = "bibliografia", ignore = true)
    @Mapping(target = "historialEstados", ignore = true)
    ProgramaEntity toEntity(ProgramaCargaAdministrativoDTO dto);

}
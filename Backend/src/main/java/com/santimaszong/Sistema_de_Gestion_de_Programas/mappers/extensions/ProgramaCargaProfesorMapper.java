package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;


import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaProfesorDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToEntityMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProgramaCargaProfesorMapper extends ToEntityMapper<ProgramaCargaProfesorDTO, ProgramaEntity> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "materia", ignore = true)
    @Mapping(target = "profesorResponsable", ignore = true)
    @Mapping(target = "bloqueMultiple", ignore = true)
    @Mapping(target = "cargaHorariaTotal", ignore = true)
    @Mapping(target = "cargaHorariaSemanal", ignore = true)
    @Mapping(target = "creditos", ignore = true)
    @Mapping(target = "cantidadSemanas", ignore = true)
    @Mapping(target = "historialEstados", ignore = true)
    ProgramaEntity toEntity(ProgramaCargaProfesorDTO dto);
}
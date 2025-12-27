package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MateriasToStringMapper {


    @Named("materiasToString")
    default List<Long> materiasToString(List<MateriaEntity> materias) {
        if (materias == null) return null;
        return materias.stream()
                .map(MateriaEntity::getId)
                .toList();
    }

    @Named("programasToString")
    default List<String> programasToString(List<ProgramaEntity> programas) {
        if (programas == null) return null;
        return programas.stream()
                .map(p-> p.getMateria().getCodigo() + " - " + p.getMateria().getNombre())
                .toList();
    }
}
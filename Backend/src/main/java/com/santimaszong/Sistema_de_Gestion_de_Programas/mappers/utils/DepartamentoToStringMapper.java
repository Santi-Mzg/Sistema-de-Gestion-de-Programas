package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface DepartamentoToStringMapper {

    @Named("departamentoToString")
    default String departamentoToString(DepartamentoEntity u) {
        if (u == null) return null;
        return u.getNombre();
    }
}
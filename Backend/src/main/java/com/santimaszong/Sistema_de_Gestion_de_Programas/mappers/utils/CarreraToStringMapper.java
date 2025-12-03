package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface CarreraToStringMapper {

    @Named("carreraToString")
    default String carreraToString(CarreraEntity u) {
        if (u == null) return null;
        return u.getNombre();
    }
}
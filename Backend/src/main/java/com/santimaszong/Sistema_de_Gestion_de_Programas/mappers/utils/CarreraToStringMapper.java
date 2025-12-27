package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CarreraToStringMapper {


    @Named("carrerasToString")
    default List<Long> carrerasToString(List<CarreraEntity> carreras) {
        if (carreras == null) return null;
        return carreras.stream()
                .map(CarreraEntity::getId)
                .toList();
    }
}
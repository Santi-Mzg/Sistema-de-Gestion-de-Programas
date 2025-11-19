package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers;

import java.util.List;

public interface ToEntityMapper<D, E> {
    E toEntity(D dto);
    List<E> toEntityList(List<D> dtoList);
}

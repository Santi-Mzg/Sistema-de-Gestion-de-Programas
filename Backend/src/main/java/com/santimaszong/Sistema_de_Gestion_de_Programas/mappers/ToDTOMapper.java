package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers;

import java.util.List;

public interface ToDTOMapper<E, R> {
    R toDTO(E entity);
    List<R> toDTOList(List<E> entityList);
}

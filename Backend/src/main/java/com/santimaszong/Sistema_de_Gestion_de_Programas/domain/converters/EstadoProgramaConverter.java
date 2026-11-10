package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.converters;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Lee estados históricos y escribe únicamente la terminología actual. */
@Converter
public class EstadoProgramaConverter implements AttributeConverter<EstadoPrograma, String> {

    @Override
    public String convertToDatabaseColumn(EstadoPrograma estado) {
        return estado == null ? null : estado.name();
    }

    @Override
    public EstadoPrograma convertToEntityAttribute(String valor) {
        return EstadoPrograma.fromValue(valor);
    }
}

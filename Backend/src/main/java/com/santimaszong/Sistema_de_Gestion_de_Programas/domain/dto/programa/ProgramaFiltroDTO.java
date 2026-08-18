package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;

public record ProgramaFiltroDTO(EstadoPrograma estado, String search) {
}

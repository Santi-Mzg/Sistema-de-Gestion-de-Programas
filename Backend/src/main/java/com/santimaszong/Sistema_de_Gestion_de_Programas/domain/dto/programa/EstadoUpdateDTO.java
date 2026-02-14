package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.AccionPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import lombok.Data;

@Data
public class EstadoUpdateDTO {
    private AccionPrograma accion;
    private Rol destinoRechazo;
    private String justificacion;
    private String contribucionCarrera;
}
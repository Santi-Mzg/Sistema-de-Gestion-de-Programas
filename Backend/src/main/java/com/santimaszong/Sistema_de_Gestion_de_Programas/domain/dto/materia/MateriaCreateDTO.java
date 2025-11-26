package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MateriaCreateDTO {

    private String codigo;
    private String nombre;
    private String area;
    private int horasSemanales;
    private int horasTotales;
}

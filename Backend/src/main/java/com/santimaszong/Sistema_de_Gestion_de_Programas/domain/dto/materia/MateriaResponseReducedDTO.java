package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class MateriaResponseReducedDTO {

    private Long id;
    private String codigo;
    private String nombre;
}

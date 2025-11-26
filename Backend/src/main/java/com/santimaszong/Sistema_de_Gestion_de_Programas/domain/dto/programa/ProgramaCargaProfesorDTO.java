package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgramaCargaProfesorDTO {

    private Integer cargaHorariaPractica;

    private String fundamentacion;
    private String objetivos;

    private String programaAnalitico;

    private String metodologia;

    private String modalidadEvaluacion;

    private String bibliografia;

    private String estado;

}

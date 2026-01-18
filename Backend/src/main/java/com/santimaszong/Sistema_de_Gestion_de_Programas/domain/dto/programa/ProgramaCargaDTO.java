package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgramaCargaDTO {

    // --- BLOQUE ÚNICO ---
    private Long materiaId;
    private Long profesorResponsableId;

    // --- BLOQUE MÚLTIPLE ---
    private List<ProgramaCarreraCreateDTO> bloqueMultiple;

    // --- BLOQUE ÚNICO ---
    private Integer cargaHorariaTotal;
    private Integer cargaHorariaSemanal;
    private Integer cargaHorariaPractica;
    private Integer creditos;
    private Integer cantidadSemanas;

    private String fundamentacion;
    private String objetivos;
    private String programaAnalitico;
    private String metodologia;
    private String modalidadEvaluacion;
    private String bibliografia;
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgramaCargaAdministrativoDTO {

    // --- BLOQUE ÚNICO ---
//    private String nombreDepartamento;
    private Long materiaId;

//    private Area areaMateria;

    private Long profesorResponsableId;

    // --- BLOQUE MÚLTIPLE ---
    private List<Long> carrerasIds;

    private String plan;
    private String ubicacionEnPlan;
    private String correlativas;
    private String requisitos;
    private String tipoFormacion;

    // --- BLOQUE ÚNICO ---
    private Integer cargaHorariaTotal;
    private Integer cargaHorariaSemanal;
    private Integer creditos;
    private Integer cantidadSemanas;
    private String fundamentacion;
    private String contenidosMinimos;
    private String estado;

}

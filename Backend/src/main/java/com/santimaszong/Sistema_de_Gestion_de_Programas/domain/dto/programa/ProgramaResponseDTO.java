package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgramaResponseDTO {

    private Long id;

    // --- BLOQUE ÚNICO ---
    private String nombreDepartamento;
    private String nombreMateria;
    private String codigoMateria;

//    private Area areaMateria;

    private UserEntity profesorResponsable;

    // --- BLOQUE MÚLTIPLE ---
    private List<CarreraEntity> carreras;

    private String plan;
    private String ubicacionEnPlan;

    private String correlativas;
    private String requisitos;
    private String tipoFormacion;

    // --- BLOQUE ÚNICO ---
    private Integer cargaHorariaTotal;
    private Integer cargaHorariaSemanal;
    private Integer cargaHorariaPractica;
    private Integer creditos;
    private Integer cantidadSemanas;

    private String descripcion;
    private String fundamentacion;
    private String objetivos;

    private String contenidosMinimos;

    private String programaAnalitico;

    private String metodologia;

    private String modalidadEvaluacion;

    private String bibliografia;

    private List<String> historialEstados;

}

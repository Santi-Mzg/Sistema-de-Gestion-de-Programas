package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.EstadoHistoricoEntity;
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
    private String areaMateria;
    private String profesorResponsable;

    // --- BLOQUE MÚLTIPLE ---
    private List<ProgramaCarreraResponseDTO> carreras;

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

    private String estado;
    private List<EstadoHistoricoEntity> historialEstados;
}


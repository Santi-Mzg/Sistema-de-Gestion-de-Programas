package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseReducedDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DecisionComisionEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
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
    private Integer anio;
    private MateriaResponseDTO materia;
    private UserResponseReducedDTO profesorResponsable;

    // --- BLOQUE MÚLTIPLE ---
    private List<ProgramaCarreraResponseDTO> bloqueMultiple;

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

    private EstadoPrograma estado;
    private List<EstadoHistoricoResponseDTO> historialEstados;
    private Boolean aprobado;

}


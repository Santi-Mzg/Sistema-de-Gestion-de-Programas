package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseReducedDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgramaResponseReducedDTO {

    private Long id;

    // --- BLOQUE ÚNICO ---
    private Integer anio;
    private MateriaResponseDTO materia;
    private UserResponseReducedDTO profesorResponsable;

    // --- BLOQUE ÚNICO ---
    private EstadoPrograma estado;
    private Boolean aprobado;

}


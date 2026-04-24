package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraPlanResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseReducedDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgramaCarreraResponseDTO {

    // --- BLOQUE MÚLTIPLE ---
    private String key;
    private String carreraNombre;
    private CarreraPlanResponseDTO plan;
    private String ubicacionEnPlan;
    private Set<MateriaResponseReducedDTO> correlativasFuertes;
    private Set<MateriaResponseReducedDTO> correlativasDebiles;
    private String contribucion;
    private String contenidosMinimos;
    private Boolean aprobadoPorComision;
}

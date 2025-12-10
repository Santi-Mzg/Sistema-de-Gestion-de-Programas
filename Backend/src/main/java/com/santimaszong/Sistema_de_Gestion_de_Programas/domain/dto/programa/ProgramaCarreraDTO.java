package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgramaCarreraResponseDTO {

    // --- BLOQUE MÚLTIPLE ---
    private String key;
    private String carrera;
    private String plan;
    private String ubicacionEnPlan;
    private List<Long> correlativasFuertesIds;
    private List<Long> correlativasDebilesIds;
    private String contribucion;
    private String contenidosMinimos;
}

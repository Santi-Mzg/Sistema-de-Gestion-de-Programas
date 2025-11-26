package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgramaCarreraResponseDTO {

    // --- BLOQUE MÚLTIPLE ---
    private CarreraEntity carrera;
    private String plan;
    private String ubicacionEnPlan;
    private List<CarreraEntity> correlativasFuertes;
    private List<CarreraEntity> correlativasDebiles;
    private String contribucion;
    private String contenidosMinimos;
}

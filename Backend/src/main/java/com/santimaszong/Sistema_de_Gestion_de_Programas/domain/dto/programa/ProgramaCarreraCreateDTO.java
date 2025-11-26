package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgramaCarreraCreateDTO {

    // --- BLOQUE MÚLTIPLE ---
    private Long carreraId;
    private String plan;
    private String ubicacionEnPlan;
    private List<Long> correlativasFuertesIds;
    private List<Long> correlativasDebilesIds;
    private String contribucion;
    private String contenidosMinimos;
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgramaCarreraCreateDTO {

    // --- BLOQUE MÚLTIPLE ---
    private String key;
    private Long carreraPlanId;
    private String ubicacionEnPlan;
    private Set<Long> correlativasFuertesIds;
    private Set<Long> correlativasDebilesIds;
    private String contribucion;
    private String contenidosMinimos;
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AreaCreateDTO {

    private String nombre;
    private Long departamentoId;
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CarreraCreateDTO {
    private String codigo;
    private String nombre;
    private String duracion;
    private Long departamentoId;
}

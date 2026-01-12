package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CarreraPlanCreateDTO {
    private String anio;
    private Integer version;
}
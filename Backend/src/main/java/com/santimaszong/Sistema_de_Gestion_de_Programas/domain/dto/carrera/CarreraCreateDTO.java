package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CarreraCreateDTO {
    private String codigo;
    private String nombre;
    private String duracion;
    private int cantidadMaterias;
    private List<Long> materiasIds;
    private Long departamentoId;
    private Long comisionId;
    private List<Long> profesoresIds;
}

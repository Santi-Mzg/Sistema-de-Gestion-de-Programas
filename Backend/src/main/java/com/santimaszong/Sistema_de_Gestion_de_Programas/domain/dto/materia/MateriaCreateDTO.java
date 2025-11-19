package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MateriaCreateDTO {

    private String codigo;
    private String nombre;
    private int horasSemanales;
    private int horasTotales;
//    private List<Long> carrerasIds;
//    private List<Long> programasIds;
    private List<Long> correlativasFuertesIds;
    private List<Long> correlativasDebilesIds;
//    private List<Long> requierenComoFuerteIds;
//    private List<Long> requierenComoDebilIds;
}

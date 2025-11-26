package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MateriaResponseDTO {

    private Long id;

    private String codigo;
    private String nombre;
    private String area;
    private int horasSemanales;
    private int horasTotales;
    private List<CarreraEntity> carreras;
    private List<ProgramaEntity> programas;
    private List<MateriaEntity> correlativasFuertes;
    private List<MateriaEntity> correlativasDebiles;
    private List<MateriaEntity> requierenComoFuerte;
    private List<MateriaEntity> requierenComoDebil;
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartamentoResponseDTO {

    private Long id;
    private String nombre;
    private String direccion;
    private String cuerpo;
    private String email;
    private String sitioWeb;
    private String secretaria;
    private List<CarreraResponseDTO> carreras;
    private List<AreaResponseDTO> areas;
    private List<MateriaResponseDTO> materias;
}

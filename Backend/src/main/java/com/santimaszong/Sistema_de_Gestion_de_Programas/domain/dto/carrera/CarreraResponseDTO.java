package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCarreraResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CarreraResponseDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String duracion;
    private Integer cantidadMaterias;
    private List<ProgramaCarreraResponseDTO> materias;
    private String departamento;
    private String comision;
}

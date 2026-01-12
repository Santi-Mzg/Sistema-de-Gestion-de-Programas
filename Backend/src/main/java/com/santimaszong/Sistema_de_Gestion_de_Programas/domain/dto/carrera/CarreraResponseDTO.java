package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseReducedDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CarreraResponseDTO {
    private Long id;
    private String nombre;
    private String duracion;
    private Integer cantidadMaterias;
    private List<CarreraPlanResponseDTO> planes;
    private UserResponseReducedDTO comision;
}

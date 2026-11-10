package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseReducedDTO;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AreaResponseDTO {

    private Long id;
    private String nombre;
    private Long departamentoId;
    private UserResponseReducedDTO coordinador;
}

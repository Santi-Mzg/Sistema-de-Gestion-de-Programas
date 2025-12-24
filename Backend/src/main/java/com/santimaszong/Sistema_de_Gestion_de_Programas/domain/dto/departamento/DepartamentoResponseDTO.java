package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseReducedDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartamentoResponseDTO {

    private Long id;
    private String nombre;
    private String direccion;
    private String telefono;
    private String email;
    private String sitioWeb;
    private UserResponseReducedDTO secretaria;
    private UserResponseReducedDTO direccionAdministrativa;

}

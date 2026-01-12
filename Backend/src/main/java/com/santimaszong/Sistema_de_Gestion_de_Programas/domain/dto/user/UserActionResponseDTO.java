package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserActionResponseDTO {

    private Long id;

    private String nombre;
    private String apellido;
    private String legajo;
    private Rol activeRol;
    private String deptName;

}

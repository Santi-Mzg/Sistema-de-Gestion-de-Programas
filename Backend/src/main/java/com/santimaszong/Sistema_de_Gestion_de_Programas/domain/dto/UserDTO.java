package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Departamento;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {

    private Long id;

    private String nombre;
    private String apellido;
    private String legajo;

    private Departamento departamento;

    private UserType rol;
}

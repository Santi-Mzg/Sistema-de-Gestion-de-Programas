package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {

    private Long id;

    private String nombre;
    private String apellido;
    private String legajo;

    private DepartamentoEntity departamento;

    private Set<Rol> roles;
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseReducedDTO {

    private Long id;

    private String nombre;
    private String apellido;
    private String legajo;

}

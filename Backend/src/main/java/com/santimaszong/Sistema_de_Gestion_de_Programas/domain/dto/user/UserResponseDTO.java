package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDTO {

    private Long id;

    private String nombre;
    private String apellido;
    private String legajo;

    @JsonProperty("isAdmin")
    private boolean isAdmin;

    private List<UsuarioDepartamentoDTO> departamentos;
}

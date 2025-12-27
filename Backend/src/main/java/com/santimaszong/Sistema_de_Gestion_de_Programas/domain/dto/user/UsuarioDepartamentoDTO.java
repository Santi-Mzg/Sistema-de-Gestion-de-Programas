package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user;

import java.util.List;
import java.util.Set;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDepartamentoDTO {

    private Long departamentoId;
    private String departamentoNombre;
    private String email;
    private List<Long> carrerasComoComision;
    private List<String> materiasComoProfesor;
    private Set<Rol> roles;
}

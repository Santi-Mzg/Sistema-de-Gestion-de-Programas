package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDepartamentoDTO {

    private String departamento;
    private String email;
    private List<String> carrerasComoComision;
    private List<String> materiasComoProfesor;
    private Set<Rol> roles;
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.RolType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDTO {

    private Long id;

    private String nombre;
    private String apellido;
    private String DNI;
    private String legajo;
    private String email;

    private DepartamentoEntity departamentoAdministracion;
    private CarreraEntity carreraComoComision;
    private CarreraEntity carreraComoProfesor;
    private List<ProgramaEntity> materiasComoProfesor;

    private Set<RolType> roles;

}

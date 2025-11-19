package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.RolType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserCreateDTO {

    private Long id;

    private String nombre;
    private String apellido;
    private String DNI;
    private String legajo;
    private String email;

//    private Long departamentoAdministracionId;

//    private Long carreraComoComisionId;
//    private Long carreraComoProfesorId;
//    private List<Long> materiasComoProfesorId;

    private Set<RolType> roles;
}

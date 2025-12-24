package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartamentoCreateDTO {

    private String nombre;
    private String direccion;
    private String telefono;
    private String email;
    private String sitioWeb;
    private Long dirAdminId;
}

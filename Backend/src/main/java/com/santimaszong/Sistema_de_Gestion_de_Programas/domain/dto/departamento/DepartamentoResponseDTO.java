package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartamentoResponseDTO {

    private Long id;
    private String nombre;
    private String direccion;
    private String cuerpo;
    private String email;
    private String sitioWeb;
    private List<UserEntity> administracion;
    private UserEntity secretaria;
    private List<CarreraEntity> carreras;
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Carrera;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DepartamentoDTO {

    private Long id;
    private String nombre;
    private String direccion;
    private String cuerpo;
    private String email;
    private String sitioWeb;
    private List<CarreraEntity> carreras;
    private UserEntity administracion;
    private UserEntity secretaria;
}

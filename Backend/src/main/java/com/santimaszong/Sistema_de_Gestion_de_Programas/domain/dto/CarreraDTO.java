package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
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
public class CarreraDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String duracion;
    private int cantidadMaterias;
    private List<MateriaEntity> materias;
    private DepartamentoEntity departamento;
    private UserEntity comision;
    private List<UserEntity> profesores;
}

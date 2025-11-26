package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CarreraResponseDTO {
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

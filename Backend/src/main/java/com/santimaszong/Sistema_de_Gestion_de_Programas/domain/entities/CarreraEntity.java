package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "carreras")
public class CarreraEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_carrera", nullable = false, unique = true)
    private String codigo;

    @Column(name = "nombre_carrera", nullable = false, unique = true)
    private String nombre;

    @Column(name = "duracion_carrera", nullable = false)
    private String duracion;

    @Column(name = "cantidad_materias_carrera", nullable = false)
    private int cantidadMaterias;


    @ManyToMany(mappedBy = "carreras", fetch = FetchType.LAZY)
    private List<MateriaEntity> materias;

    @OneToMany(mappedBy = "carrera", fetch = FetchType.LAZY)
    private List<ProgramaCarreraEntity> programas;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    private DepartamentoEntity departamento;

    @OneToOne(mappedBy = "carreraComoComision", fetch = FetchType.LAZY)
    private UserEntity comision;

    @OneToMany(mappedBy = "carreraComoProfesor", fetch = FetchType.LAZY)
    private List<UserEntity> profesores;
}

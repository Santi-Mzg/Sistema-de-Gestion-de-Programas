package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "carreras")
public class CarreraEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_carrera", nullable = false)
    private String codigo;

    @Column(name = "nombre_carrera", nullable = false)
    private String nombre;

    @Column(name = "duracion_carrera")
    private String duracion;

    @Column(name = "cantidadMaterias_carrera")
    private int cantidadMaterias;


    @ManyToMany(mappedBy = "carreras", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MateriaEntity> materias;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    private DepartamentoEntity departamento;

    @OneToOne(mappedBy = "carreraComoComision", fetch = FetchType.LAZY)
    private UserEntity comision;

    @OneToMany(mappedBy = "carreraComoProfesor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserEntity> profesores;
}

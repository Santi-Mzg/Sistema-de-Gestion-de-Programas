package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "carreras")
public class CarreraEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_carrera", nullable = false, unique = true)
    private String nombre;

    @Column(name = "duracion_carrera", nullable = false)
    private String duracion;

    @OneToMany(mappedBy = "carrera", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CarreraPlanEntity> planes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    private DepartamentoEntity departamento;

    @ManyToOne
    @JoinColumn(name = "comision_id")
    private UsuarioDepartamentoEntity comision;

}

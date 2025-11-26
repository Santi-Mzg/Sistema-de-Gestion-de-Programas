package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name="programas_carrera")
public class ProgramaCarreraEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programa_id")
    private ProgramaEntity programa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id")
    private CarreraEntity carrera;

    private String plan;
    private String ubicacionEnPlan;

    @ManyToMany
    @JoinTable(
            name = "programa_carrera_correlativas_fuertes",
            joinColumns = @JoinColumn(name = "programa_carrera_id"),
            inverseJoinColumns = @JoinColumn(name = "materia_id")
    )
    private List<MateriaEntity> correlativasFuertes = new ArrayList<>();


    @ManyToMany
    @JoinTable(
            name = "programa_carrera_correlativas_debiles",
            joinColumns = @JoinColumn(name = "programa_carrera_id"),
            inverseJoinColumns = @JoinColumn(name = "materia_id")
    )
    private List<MateriaEntity> correlativasDebiles = new ArrayList<>();

    private String contribucion;
    private String contenidosMinimos;

}

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
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private ProgramaEntity programa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_plan_id")
    private CarreraPlanEntity carreraPlan;

    private String ubicacionEnPlan;

    @ManyToMany
    @JoinTable(
            name = "programa_carrera_correlativas_fuertes",
            joinColumns = @JoinColumn(name = "programa_carrera_id"),
            inverseJoinColumns = @JoinColumn(name = "materia_id")
    )
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private List<MateriaEntity> correlativasFuertes = new ArrayList<>();


    @ManyToMany
    @JoinTable(
            name = "programa_carrera_correlativas_debiles",
            joinColumns = @JoinColumn(name = "programa_carrera_id"),
            inverseJoinColumns = @JoinColumn(name = "materia_id")
    )
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private List<MateriaEntity> correlativasDebiles = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String contribucion;

    @Column(columnDefinition = "TEXT")
    private String contenidosMinimos;

}

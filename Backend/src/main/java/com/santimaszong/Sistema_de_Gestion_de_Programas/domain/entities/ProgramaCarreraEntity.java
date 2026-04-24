package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
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
    private Set<MateriaEntity> correlativasFuertes = new HashSet<>();


    @ManyToMany
    @JoinTable(
            name = "programa_carrera_correlativas_debiles",
            joinColumns = @JoinColumn(name = "programa_carrera_id"),
            inverseJoinColumns = @JoinColumn(name = "materia_id")
    )
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Set<MateriaEntity> correlativasDebiles = new HashSet<>();

    @Column(columnDefinition = "TEXT")
    private String contribucion;

    @Column(columnDefinition = "TEXT")
    private String contenidosMinimos;

    @OneToOne(mappedBy = "programaCarrera", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private DecisionComisionEntity decisionComision;


}

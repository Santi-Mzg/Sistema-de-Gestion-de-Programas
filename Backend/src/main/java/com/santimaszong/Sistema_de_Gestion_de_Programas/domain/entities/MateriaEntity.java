package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.WhereJoinTable;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "materias")
public class MateriaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_materia", nullable = false)
    private String codigo;

    @Column(name = "nombre_materia", nullable = false)
    private String nombre;

    @Column(name = "horas_semanales")
    private int horasSemanales;

    @Column(name = "horas_totales")
    private int horasTotales;


    // 🔹 Relación con Profesor (User con rol profesor)
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "profesor_id")
//    private UserEntity profesor;

    // 🔹 Relación con Carrera (muchas materias pueden pertenecer a muchas carreras)
    @ManyToMany
    @JoinTable(
            name = "carrera_materia",
            joinColumns = @JoinColumn(name = "materia_id"),
            inverseJoinColumns = @JoinColumn(name = "carrera_id")
    )
    @Builder.Default
    private List<CarreraEntity> carreras = new ArrayList<>();

    // 🔹 Relación con Plan
    @OneToMany(mappedBy = "materia", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProgramaEntity> programas = new ArrayList<>();

    // 🔹 Correlativas Fuertes
    @ManyToMany
    @JoinTable(
            name = "materia_correlativas",
            joinColumns = @JoinColumn(name = "materia_id"),
            inverseJoinColumns = @JoinColumn(name = "correlativa_id")
    )
    @WhereJoinTable(clause = "tipo_correlativa = 'fuerte'")
    @Builder.Default
    private List<MateriaEntity> correlativasFuertes = new ArrayList<>();

    // 🔹 Correlativas Débiles
    @ManyToMany
    @JoinTable(
            name = "materia_correlativas",
            joinColumns = @JoinColumn(name = "materia_id"),
            inverseJoinColumns = @JoinColumn(name = "correlativa_id")
    )
    @WhereJoinTable(clause = "tipo_correlativa = 'debil'")
    @Builder.Default
    private List<MateriaEntity> correlativasDebiles = new ArrayList<>();

    // 🔹 Materias que la requieren como fuerte
    @ManyToMany(mappedBy = "correlativasFuertes")
    @Builder.Default
    private List<MateriaEntity> requierenComoFuerte = new ArrayList<>();

    // 🔹 Materias que la requieren como débil
    @ManyToMany(mappedBy = "correlativasDebiles")
    @Builder.Default
    private List<MateriaEntity> requierenComoDebil = new ArrayList<>();

}

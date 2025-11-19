package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.WhereJoinTable;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "materias")
public class MateriaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_materia", nullable = false, unique = true)
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
    private List<CarreraEntity> carreras = new ArrayList<>();

    @OneToMany(mappedBy = "materia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProgramaEntity> programas = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "materia_correlativas",
            joinColumns = @JoinColumn(name = "materia_id"),
            inverseJoinColumns = @JoinColumn(name = "correlativa_id")
    )
    @WhereJoinTable(clause = "tipo_correlativa = 'fuerte'")
    private List<MateriaEntity> correlativasFuertes = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "materia_correlativas",
            joinColumns = @JoinColumn(name = "materia_id"),
            inverseJoinColumns = @JoinColumn(name = "correlativa_id")
    )
    @WhereJoinTable(clause = "tipo_correlativa = 'debil'")
    private List<MateriaEntity> correlativasDebiles = new ArrayList<>();

    @ManyToMany(mappedBy = "correlativasFuertes")
    private List<MateriaEntity> requierenComoFuerte = new ArrayList<>();

    @ManyToMany(mappedBy = "correlativasDebiles")
    private List<MateriaEntity> requierenComoDebil = new ArrayList<>();

}

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

    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(nullable = false)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    private AreaEntity area;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    private DepartamentoEntity departamento;

    @OneToMany(mappedBy = "materia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProgramaEntity> programas = new ArrayList<>();

    @ManyToMany(mappedBy = "correlativasFuertes")
    private List<ProgramaCarreraEntity> requierenComoFuerte = new ArrayList<>();

    @ManyToMany(mappedBy = "correlativasDebiles")
    private List<ProgramaCarreraEntity> requierenComoDebil = new ArrayList<>();

}

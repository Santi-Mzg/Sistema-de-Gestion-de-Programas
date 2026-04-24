package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "carreras_planes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_carrera_anio_version",
                        columnNames = {"carrera_id", "anio", "version"}
                )
        }
)
public class CarreraPlanEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String anio;

    @Column(nullable = false)
    private Integer version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id", nullable = false)
    private CarreraEntity carrera;

    @OneToMany(mappedBy = "carreraPlan", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ProgramaCarreraEntity> materias;
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.List;

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
    @BatchSize(size = 5)
    private List<MateriaEntity> correlativasFuertes = new ArrayList<>();


    @ManyToMany
    @JoinTable(
            name = "programa_carrera_correlativas_debiles",
            joinColumns = @JoinColumn(name = "programa_carrera_id"),
            inverseJoinColumns = @JoinColumn(name = "materia_id")
    )
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    @BatchSize(size = 5)
    private List<MateriaEntity> correlativasDebiles = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String contribucion;


    /** La decisión vigente se obtiene de la ronda activa, sin borrar las anteriores. */
    @Transient
    public DecisionComisionEntity getDecisionComision() {
        if (programa == null || carreraPlan == null) return null;
        var estado = programa.getEstadoActual();
        if (estado != com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES
                && estado != com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL
                && estado != com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma.APROBADO) {
            return null;
        }
        return programa.getDecisionesComision().stream()
                .filter(d -> java.util.Objects.equals(d.getRonda(), programa.getRondaRevision())
                        && java.util.Objects.equals(d.getCarreraPlanId(), carreraPlan.getId()))
                .findFirst().orElse(null);
    }


}

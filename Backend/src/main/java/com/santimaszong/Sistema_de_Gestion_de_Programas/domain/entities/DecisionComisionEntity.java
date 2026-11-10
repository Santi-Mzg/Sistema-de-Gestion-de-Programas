package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;


import jakarta.persistence.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.ResultadoDecisionComision;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "decisiones_comision", uniqueConstraints = @UniqueConstraint(
        name = "uk_decision_programa_plan_ronda", columnNames = {"programa_id", "carrera_plan_id", "ronda"}))
public class DecisionComisionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programa_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ProgramaEntity programa;

    // El historial pertenece al programa y sobrevive a la remoción de un bloque.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programa_carrera_id", referencedColumnName = "id", foreignKey = @ForeignKey(name = "fk_decision_programa_carrera"))
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private ProgramaCarreraEntity programaCarrera;

    @Column(nullable = false)
    private Integer ronda;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResultadoDecisionComision resultado = ResultadoDecisionComision.PENDIENTE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private UsuarioDepartamentoEntity actor;

    private LocalDateTime fechaDecision;

    @Column(columnDefinition = "TEXT")
    private String justificacion;

    @Enumerated(EnumType.STRING)
    private Rol destinoRechazo;

    // Copia descriptiva del bloque al abrir la ronda: no cambia con sus ediciones posteriores.
    @Column(name = "carrera_plan_id", nullable = false)
    private Long carreraPlanId;
    private String carreraNombre;
    private String planAnio;
    private Integer planVersion;

    public boolean isAprobado() {
        return resultado == ResultadoDecisionComision.APROBADA;
    }
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;


import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "decisiones_comision")
public class DecisionComisionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "programa_id")
//    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
//    private ProgramaEntity programa;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "comision_id")
//    private UsuarioDepartamentoEntity comision;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programa_carrera_id", referencedColumnName = "id", foreignKey = @ForeignKey(name = "fk_decision_programa_carrera"))
    private ProgramaCarreraEntity programaCarrera;

    private boolean aprobado = false; // true = aprobó, false = rechazó (o pendiente)

    private LocalDateTime fechaDecision;
}
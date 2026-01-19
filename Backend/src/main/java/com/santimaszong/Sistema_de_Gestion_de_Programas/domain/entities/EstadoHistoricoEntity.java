package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;


import java.sql.Types;
import java.time.LocalDateTime;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

@Data
@Entity
@NoArgsConstructor
@Table(name = "estado_historico")
public class EstadoHistoricoEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programa_id")
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private ProgramaEntity programa;

    @Enumerated(EnumType.STRING)
    private EstadoPrograma estado;

    private LocalDateTime fecha;

    @Column(columnDefinition = "TEXT")
    @JdbcTypeCode(Types.LONGVARCHAR)
    private String justificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private UsuarioDepartamentoEntity actor;

    private Rol actorRol;

}

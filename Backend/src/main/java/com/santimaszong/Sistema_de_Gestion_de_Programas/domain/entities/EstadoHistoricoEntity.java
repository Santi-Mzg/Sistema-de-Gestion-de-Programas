package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;


import java.sql.Types;
import java.time.LocalDateTime;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "estado_historico")
public class EstadoHistoricoEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programa_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ProgramaEntity programa;

    @Convert(converter = com.santimaszong.Sistema_de_Gestion_de_Programas.domain.converters.EstadoProgramaConverter.class)
    private EstadoPrograma estado;

    private LocalDateTime fecha;

    @Column(columnDefinition = "TEXT")
    @JdbcTypeCode(Types.LONGVARCHAR)
    private String justificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private UsuarioDepartamentoEntity actor;

    private Rol actorRol;
    /** Contexto de una transición automática o de revisión; no es una justificación de rechazo. */
    @Column(columnDefinition = "TEXT")
    private String observacion;

}

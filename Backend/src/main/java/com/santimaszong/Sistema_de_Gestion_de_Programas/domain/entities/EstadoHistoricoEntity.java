package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;


import java.time.LocalDateTime;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@Table(name = "estado_historico")
public class EstadoHistoricoEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programa_id", nullable = false)
    private ProgramaEntity programa;

    @Enumerated(EnumType.STRING)
    private EstadoPrograma estado;

    private LocalDateTime fecha;

    @Column(nullable = true)
    private String justificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "realizado_por_id", nullable = false)
    private UserEntity realizadoPor;

}

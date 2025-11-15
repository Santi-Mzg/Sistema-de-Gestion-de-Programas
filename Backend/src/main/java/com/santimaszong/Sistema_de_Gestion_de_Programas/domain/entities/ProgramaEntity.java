package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Carrera;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Entity
@Table(name="programas")
@Data
public class ProgramaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- BLOQUE ÚNICO ---
    //    private DepartamentoEntity departamento;

    @ManyToOne
    @JoinColumn(name = "materia_id")
    private MateriaEntity materia;

    //    private Area areaMateria;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesorResponsable_id")
    private UserEntity profesorResponsable;

    // --- BLOQUE MÚLTIPLE ---
    private Set<Carrera> carreras;

    private String plan;
    private String ubicacionEnPlan;

    private String correlativas;
    private String requisitos;
    private String tipoFormacion;

    // --- BLOQUE ÚNICO ---
    private Integer cargaHorariaTotal;
    private Integer cargaHorariaSemanal;
    private Integer cargaHorariaPractica;
    private Integer creditos;
    private Integer cantidadSemanas;

    private String descripcion;
    private String fundamentacion;
    private String objetivos;

    @Column(columnDefinition = "TEXT")
    private String contenidosMinimos;

    @Column(columnDefinition = "TEXT")
    private String programaAnalitico;

    @Column(columnDefinition = "TEXT")
    private String metodologia;

    @Column(columnDefinition = "TEXT")
    private String modalidadEvaluacion;

    @Column(columnDefinition = "TEXT")
    private String bibliografia;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoPrograma estado;
}

// Año y cuatrimestre de la carrera
package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Carrera;
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
    private int cargaHorariaTotal;
    private int cargaHorariaSemanal;
    private int cargaHorariaPractica;
    private int creditos;
    private int cantidadSemanas;

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
}

// Año y cuatrimestre de la carrera
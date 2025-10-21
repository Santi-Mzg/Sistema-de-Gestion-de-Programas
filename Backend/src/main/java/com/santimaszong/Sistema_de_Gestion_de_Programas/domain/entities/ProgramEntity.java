package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Carrera;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name="programs")
@Data
public class ProgramEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- BLOQUE ÚNICO ---
    private String nombreDepartamento;
    private String nombreMateria;
    private String codigoMateria;

//    @Enumerated(EnumType.STRING)
//    private Area areaMateria;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity profesorResponsable;

    // --- BLOQUE MÚLTIPLE ---
    @ElementCollection
    @Enumerated(EnumType.STRING)
    private List<Carrera> carreras;

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
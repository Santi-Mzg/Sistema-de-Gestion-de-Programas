package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name="programas")
public class ProgramaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer anio;

    // --- BLOQUE ÚNICO ---
    @ManyToOne
    @JoinColumn(name = "materia_id")
    private MateriaEntity materia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesor_responsable_id")
    private UsuarioDepartamentoEntity profesorResponsable;

    // --- BLOQUE MÚLTIPLE ---
    @OneToMany(mappedBy = "programa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProgramaCarreraEntity> bloqueMultiple = new ArrayList<>();

    // --- BLOQUE ÚNICO ---
    private Integer cargaHorariaTotal;
    private Integer cargaHorariaSemanal;
    private Integer cargaHorariaPractica;
    private Integer creditos;
    private Integer cantidadSemanas;

    private String fundamentacion;
    private String objetivos;
    private String programaAnalitico;
    private String metodologia;
    private String modalidadEvaluacion;
    private String bibliografia;

    @Enumerated(EnumType.STRING)
    private EstadoPrograma estadoActual;

    @OneToMany(mappedBy = "programa", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("fecha ASC")
    private List<EstadoHistoricoEntity> historialEstados = new ArrayList<>();


    public void registrarNuevoEstado(EstadoPrograma estado, UserEntity actor, String justificacion){
        EstadoHistoricoEntity nuevoEstadoHistorico = new EstadoHistoricoEntity();
        nuevoEstadoHistorico.setPrograma(this);
        nuevoEstadoHistorico.setEstado(estado);
        nuevoEstadoHistorico.setRealizadoPor(actor);
        nuevoEstadoHistorico.setJustificacion(justificacion);
        nuevoEstadoHistorico.setFecha(LocalDateTime.now());

        historialEstados.add(nuevoEstadoHistorico);

        this.setEstadoActual(estado);
    }

}

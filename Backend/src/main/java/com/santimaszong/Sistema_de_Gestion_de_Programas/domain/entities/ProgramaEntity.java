package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import jakarta.persistence.*;
import lombok.*;
<<<<<<< HEAD
import org.hibernate.annotations.WhereJoinTable;
=======
>>>>>>> RolesAsEnums

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name="programas")
public class ProgramaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- BLOQUE ÚNICO ---
<<<<<<< HEAD
=======
    //    private DepartamentoEntity departamento;

>>>>>>> RolesAsEnums
    @ManyToOne
    @JoinColumn(name = "materia_id")
    private MateriaEntity materia;

<<<<<<< HEAD
=======
    //    private Area areaMateria;
>>>>>>> RolesAsEnums
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesor_responsable_id")
    private UserEntity profesorResponsable;

    // --- BLOQUE MÚLTIPLE ---
<<<<<<< HEAD
    @OneToMany(mappedBy = "programa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProgramaCarreraEntity> carreras = new ArrayList<>();
=======
    private Set<CarreraEntity> carreras;

    private String plan;
    private String ubicacionEnPlan;

    private String correlativas;
    private String requisitos;
    private String tipoFormacion;
>>>>>>> RolesAsEnums

    // --- BLOQUE ÚNICO ---
    private Integer cargaHorariaTotal;
    private Integer cargaHorariaSemanal;
    private Integer cargaHorariaPractica;
    private Integer creditos;
    private Integer cantidadSemanas;

    private String fundamentacion;
    private String objetivos;
<<<<<<< HEAD
    private String programaAnalitico;
    private String metodologia;
    private String modalidadEvaluacion;
=======

    @Column(columnDefinition = "TEXT")
    private String contenidosMinimos;

    @Column(columnDefinition = "TEXT")
    private String programaAnalitico;

    @Column(columnDefinition = "TEXT")
    private String metodologia;

    @Column(columnDefinition = "TEXT")
    private String modalidadEvaluacion;

    @Column(columnDefinition = "TEXT")
>>>>>>> RolesAsEnums
    private String bibliografia;

    @OneToMany(mappedBy = "programa", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("fecha ASC")
    private List<EstadoHistoricoEntity> historialEstados = new ArrayList<>();

<<<<<<< HEAD


=======
>>>>>>> RolesAsEnums
    public EstadoPrograma getEstadoActual() {
        if (historialEstados.isEmpty()) return EstadoPrograma.INCOMPLETO_POR_ADMINISTRACION;
        return historialEstados.get(historialEstados.size() - 1).getEstado();
    }

    public void registrarNuevoEstado(EstadoPrograma estado, UserEntity actor, String justificacion){
        EstadoHistoricoEntity nuevoEstado = new EstadoHistoricoEntity();
        nuevoEstado.setPrograma(this);
        nuevoEstado.setEstado(estado);
        nuevoEstado.setRealizadoPor(actor);
        nuevoEstado.setJustificacion(justificacion);
        nuevoEstado.setFecha(LocalDateTime.now());

        historialEstados.add(nuevoEstado);
    }

<<<<<<< HEAD
}
=======
}

// Año y cuatrimestre de la carrera
>>>>>>> RolesAsEnums

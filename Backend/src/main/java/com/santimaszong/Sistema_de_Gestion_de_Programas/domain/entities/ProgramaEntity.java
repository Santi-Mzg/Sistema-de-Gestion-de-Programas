package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;

import java.sql.Types;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(
    name="programas",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_materia_anio",
            columnNames = {"materia_id", "anio"}
        )
    }
)
public class ProgramaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer anio;

    // --- BLOQUE ÚNICO ---
    @ManyToOne
    @JoinColumn(name = "materia_id")
    private MateriaEntity materia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesor_responsable_id")
    private UsuarioDepartamentoEntity profesorResponsable;


    // --- BLOQUE MÚLTIPLE ---
    @OneToMany(mappedBy = "programa", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProgramaCarreraEntity> bloqueMultiple = new ArrayList<>();

    // --- BLOQUE ÚNICO ---
    private Integer cargaHorariaTotal;
    private Integer cargaHorariaSemanal;
    private Integer cargaHorariaPractica;
    private Integer creditos;
    private Integer cantidadSemanas;

    @Column(columnDefinition = "TEXT")
    @JdbcTypeCode(Types.LONGVARCHAR)
    private String fundamentacion;

    @Column(columnDefinition = "TEXT")
    @JdbcTypeCode(Types.LONGVARCHAR)
    private String objetivos;

    @Column(columnDefinition = "TEXT")
    @JdbcTypeCode(Types.LONGVARCHAR)
    private String programaAnalitico;

    @Column(columnDefinition = "TEXT")
    @JdbcTypeCode(Types.LONGVARCHAR)
    private String metodologia;

    @Column(columnDefinition = "TEXT")
    @JdbcTypeCode(Types.LONGVARCHAR)
    private String modalidadEvaluacion;

    @Column(columnDefinition = "TEXT")
    @JdbcTypeCode(Types.LONGVARCHAR)
    private String bibliografia;

    @Enumerated(EnumType.STRING)
    private EstadoPrograma estadoActual;

    @OneToMany(mappedBy = "programa", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("fecha ASC")
    private List<EstadoHistoricoEntity> historialEstados = new ArrayList<>();

//    @OneToMany(mappedBy = "programa", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
//    private List<DecisionComisionEntity> decisionComisiones = new ArrayList<>();



    public void registrarNuevoEstado(EstadoPrograma estado, UsuarioDepartamentoEntity actor, Rol actorRol, String justificacion){
        EstadoHistoricoEntity nuevoEstadoHistorico = new EstadoHistoricoEntity();
        nuevoEstadoHistorico.setPrograma(this);
        nuevoEstadoHistorico.setEstado(estado);
        nuevoEstadoHistorico.setActor(actor);
        nuevoEstadoHistorico.setActorRol(actorRol);
        nuevoEstadoHistorico.setJustificacion(justificacion);
        nuevoEstadoHistorico.setFecha(LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires")));

        historialEstados.add(nuevoEstadoHistorico);

        this.setEstadoActual(estado);
    }

    public UsuarioDepartamentoEntity getAdministracionResponsable() {
        if (this.historialEstados == null || this.historialEstados.isEmpty()) {
            return null;
        }

        return historialEstados.stream()
                .filter(h -> h.getActorRol().equals(Rol.ADMINISTRACION))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Estado Histórico no encontrado en historial"))
                .getActor();
    }

}

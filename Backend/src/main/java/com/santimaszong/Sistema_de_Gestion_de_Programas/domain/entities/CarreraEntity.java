package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "carreras")
public class CarreraEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_carrera", nullable = false, unique = true)
    private String nombre;

    @Column(name = "duracion_carrera", nullable = false)
    private String duracion;

    @Column(nullable = false)
    private String plan;

    @OneToMany(mappedBy = "carrera", fetch = FetchType.LAZY)
    private List<ProgramaCarreraEntity> materias;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    private DepartamentoEntity departamento;

    @ManyToOne
    @JoinColumn(name = "comision_id")
    private UsuarioDepartamentoEntity comision;

}

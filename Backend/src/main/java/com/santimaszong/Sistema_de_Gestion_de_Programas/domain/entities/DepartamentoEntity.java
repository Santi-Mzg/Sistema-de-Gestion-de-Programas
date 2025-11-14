package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import jakarta.persistence.*;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "departamentos")
public class DepartamentoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_departamento", nullable = false)
    private String nombre;

    @Column(name = "direccion_departamento")
    private String direccion;

    @Column(name = "cuerpo_departamento")
    private String cuerpo;

    @Column(name = "email_departamento")
    private String email;

    @Column(name = "sitioWeb_departamento")
    private String sitioWeb;



    @OneToMany(mappedBy = "departamento", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CarreraEntity> carreras;

    @OneToOne(mappedBy = "departamento", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserEntity administracion;

    @OneToOne(mappedBy = "departamento", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserEntity secretaria;
}

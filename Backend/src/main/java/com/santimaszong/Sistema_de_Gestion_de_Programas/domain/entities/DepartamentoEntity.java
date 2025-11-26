package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import jakarta.persistence.*;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "departamentos")
public class DepartamentoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_departamento", nullable = false)
    private String nombre;

    @Column(name = "direccion_departamento", nullable = false)
    private String direccion;

    @Column(name = "cuerpo_departamento", nullable = false)
    private String cuerpo;

    @Column(name = "email_departamento", nullable = false, unique = true)
    private String email;

    @Column(name = "sitio_web_departamento")
    private String sitioWeb;



    @OneToMany(mappedBy = "departamento", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CarreraEntity> carreras;

    @OneToMany(mappedBy = "departamentoAdministracion", fetch = FetchType.LAZY)
    private List<UserEntity> administracion;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secretaria_id")
    private UserEntity secretaria;
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import java.util.ArrayList;
import java.util.List;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "departamentos")
public class DepartamentoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    private String telefono;

    @Column(name = "email_departamento", nullable = false, unique = true)
    private String email;

    @Column(name = "sitio_web_departamento")
    private String sitioWeb;

    @OneToMany(mappedBy = "departamento", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MateriaEntity> materias = new ArrayList<>();

    @OneToMany(mappedBy = "departamento", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AreaEntity> areas = new ArrayList<>();

    @OneToMany(mappedBy = "departamento", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CarreraEntity> carreras = new ArrayList<>();

    @OneToMany(mappedBy = "departamento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<UsuarioDepartamentoEntity> usuarios = new ArrayList<>();

    public UsuarioDepartamentoEntity getSecretaria() {
        if (usuarios == null) return null;

        return usuarios.stream()
                .filter(ude -> ude.getRoles().contains(Rol.SECRETARIA))
                .findFirst()
                .orElse(null);
    }

    public UsuarioDepartamentoEntity getDireccionAdministrativa() {
        if (usuarios == null) return null;

        return usuarios.stream()
                .filter(ude -> ude.getRoles().contains(Rol.DIRECCION_ADMINISTRATIVA))
                .findFirst()
                .orElse(null);
    }
}

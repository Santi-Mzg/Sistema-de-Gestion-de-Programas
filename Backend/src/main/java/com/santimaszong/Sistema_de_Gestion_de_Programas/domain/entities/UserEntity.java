package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.RolType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "usuarios")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String apellido;
    private String DNI;
    private String legajo;
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    private DepartamentoEntity departamento;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carreraComoComision_id")
    private CarreraEntity carreraComoComision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carreraComoProfesor_id")
    private CarreraEntity carreraComoProfesor;

    @OneToMany(mappedBy = "profesorResponsable", fetch = FetchType.LAZY)
    private List<ProgramaEntity> materiasComoProfesor;

    @ManyToMany(fetch = FetchType.EAGER, cascade =  CascadeType.ALL)
    @JoinTable(
            name = "usuarios_roles",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "rol_id")
    )
    private Set<Rol> roles = new HashSet<>();

    // helper methods
    public void addRol(Rol rol) {
        this.roles.add(rol);
    }

    public boolean hasRole(RolType type) {
        return roles.stream().anyMatch(r -> r.getName() == type);
    }
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.*;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name="usuarios_departamentos")
public class UsuarioDepartamentoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private UserEntity usuario;

    @ManyToOne
    @JoinColumn(name = "departamento_id")
    private DepartamentoEntity departamento;

    @Column(nullable = false)
    private String email;

    @OneToMany(mappedBy = "actor", fetch = FetchType.LAZY)
    private List<EstadoHistoricoEntity> historialAcciones = new ArrayList<>();

    @OneToMany(mappedBy = "comision")
    private List<CarreraEntity> carrerasComoComision;

    @OneToMany(mappedBy = "profesorResponsable")
    private List<ProgramaEntity> materiasComoProfesor;

    @OneToMany(mappedBy = "comision", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DecisionComisionEntity> decisionComisiones = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "usuario_departamento_roles",
            joinColumns = @JoinColumn(name = "usuario_departamento_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false)
    private Set<Rol> roles = new HashSet<>();

    public boolean hasRole(Rol rol) {
        return roles.contains(rol);
    }

    public boolean hasAnyRole(Rol... roles) {
        return Arrays.stream(roles).anyMatch(this.roles::contains);
    }


}

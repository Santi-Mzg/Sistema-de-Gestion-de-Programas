package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name="usuarios-departamentos")
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

    @Column(nullable = false, unique = true)
    private String email;


    @OneToMany(mappedBy = "comision")
    private List<CarreraEntity> carrerasComoComision;

    @OneToMany(mappedBy = "profesorResponsable")
    private List<ProgramaEntity> materiasComoProfesor;


    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "usuario_departamento_roles",
            joinColumns = @JoinColumn(name = "usuario_departamento_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false)
    private Set<Rol> roles = new HashSet<>();

}

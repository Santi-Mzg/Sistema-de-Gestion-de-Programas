package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "usuarios")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "apellido", nullable = false)
    private String apellido;

    @Column(name = "dni", nullable = false, unique = true)
    private String DNI;

    @Column(name = "legajo", nullable = false, unique = true)
    private String legajo;

    @Column(name = "email", nullable = false, unique = true)
    private String email;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_administracion_id")
    private DepartamentoEntity departamentoAdministracion;

    @OneToOne(mappedBy = "secretaria", fetch = FetchType.LAZY)
    private DepartamentoEntity departamentoSecretaria;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_como_comision_id")
    private CarreraEntity carreraComoComision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_como_profesor_id")
    private CarreraEntity carreraComoProfesor;

    @OneToMany(mappedBy = "profesorResponsable", fetch = FetchType.LAZY)
    private List<ProgramaEntity> materiasComoProfesor;


//    @ManyToMany(fetch = FetchType.EAGER)
//    @JoinTable(
//            name = "usuarios_roles",
//            joinColumns = @JoinColumn(name = "usuario_id"),
//            inverseJoinColumns = @JoinColumn(name = "rol_id")
//    )
//    private Set<Rol> roles = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "usuarios_roles",
            joinColumns = @JoinColumn(name = "usuario_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false)
    private Set<Rol> roles = new HashSet<>();

    public void addRol(Rol rol) {
        this.roles.add(rol);
    }

    public void removeRol(Rol rol) {
        this.roles.remove(rol);
    }

    public boolean hasRole(Rol rol) {
        return roles.contains(rol);
    }
}

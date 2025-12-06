package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "usuarios")
public class UserEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(nullable = false, unique = true)
    private String dni;

    @Column(nullable = false, unique = true)
    private String legajo;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable=false)
    private String password;

    // ============================
    // RELACIONES
    // ============================

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

    @OneToMany(mappedBy = "profesorResponsable")
    private List<ProgramaEntity> materiasComoProfesor;

    @OneToMany(mappedBy = "realizadoPor")
    private List<EstadoHistoricoEntity> accionesRealizadas = new ArrayList<>();

    // ============================
    // ROLES
    // ============================

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "usuarios_roles",
            joinColumns = @JoinColumn(name = "usuario_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
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


    // ============================
    // USERDETAILS IMPLEMENTATION
    // ============================


    /**
     * Spring usa esto para saber qué permisos/roles tiene el usuario.
     * Siempre tiene que empezar con "ROLE_".
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(rol -> new SimpleGrantedAuthority("ROLE_" + rol.name()))
                .toList();
    }

    /**
     * Spring usa este "username" para autenticar.
     * En tu sistema el username es el email.
     */
    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }







}

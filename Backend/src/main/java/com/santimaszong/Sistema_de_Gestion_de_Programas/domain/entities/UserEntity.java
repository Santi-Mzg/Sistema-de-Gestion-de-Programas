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
    private String legajo;

    @Column(nullable=false)
    private String password;

    private boolean isAdmin;


    // ============================
    // RELACIONES
    // ============================

    @OneToMany(mappedBy = "realizadoPor")
    private List<EstadoHistoricoEntity> accionesRealizadas = new ArrayList<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<UsuarioDepartamentoEntity> departamentos = new ArrayList<>();


    // ============================
    // USERDETAILS IMPLEMENTATION
    // ============================

    /**
     * Spring usa esto para saber qué permisos/roles tiene el usuario.
     * Siempre tiene que empezar con "ROLE_".
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return departamentos.getFirst().getRoles().stream()
                .map(rol -> new SimpleGrantedAuthority("ROLE_" + rol.name()))
                .toList();
    }

    /**
     * Spring usa este "username" para autenticar.
     * En tu sistema el username es el email.
     */
    @Override
    public String getUsername() {
        return this.legajo;
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

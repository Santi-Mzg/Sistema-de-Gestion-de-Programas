package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.auth;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;

import java.util.Set;

public record RegisterRequest(String nombre, String apellido, String dni, String legajo, String email, String password, Set<Rol> roles) {}
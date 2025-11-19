package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

public enum RolType {
    ADMIN("Administrador del sistema"),
    ADMINISTRATIVO("Personal administrativo"),
    PROFESOR("Profesor"),
    COORDINADOR("Coordinador de la comisión curricular"),
    SECRETARIO("Secretario académico");

    private final String descripcion;

    RolType(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}

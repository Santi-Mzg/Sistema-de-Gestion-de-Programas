package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "Rol", enumAsRef = true)
public enum Rol {
    ADMINISTRACION("Administración"),
    DOCENTE("Docente"),
    COORDINACION_COMISION_CURRICULAR("Comisión Curricular"),
    SECRETARIA("Secretaría Académica"),
    DIRECCION_ADMINISTRATIVA("Dirección Administrativa"),
    SYSTEM_ADMIN("Administrador del Sistema"),
    COORDINADOR_AREA("Coordinador de Área");

    private final String displayName;

    Rol(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

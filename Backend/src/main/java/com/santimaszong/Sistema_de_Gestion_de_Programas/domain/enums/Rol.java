package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums;

public enum Rol {
    ADMINISTRACION("Administración"),
    DOCENTE("Docente"),
    COORDINACION_COMISION_CURRICULAR("Comisión Curricular"),
    SECRETARIA("Secretaría Académica"),
    DIRECCION_ADMINISTRATIVA("Dirección Administrativa"),
    SYSTEM_ADMIN("Administrador del Sistema");

    private final String displayName;

    Rol(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
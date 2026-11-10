package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "EstadoPrograma", enumAsRef = true)
public enum EstadoPrograma {
    // Las etapas activas indican quién debe intervenir; las devoluciones conservan su destino.
    RECHAZADO_A_ADMINISTRACION,
    PENDIENTE_DE_SECRETARIA_INICIAL,
    RECHAZADO_A_DOCENTE,
    PENDIENTE_DE_COMISIONES_CURRICULARES,
    PENDIENTE_DE_SECRETARIA_FINAL,
    APROBADO,

    PENDIENTE_DE_DOCENTE,
    RECHAZADO_A_SECRETARIA,
    PENDIENTE_DE_COORDINACION_AREA;

    /** Acepta los nombres históricos sin volver a incorporarlos como estados. */
    @com.fasterxml.jackson.annotation.JsonCreator
    public static EstadoPrograma fromValue(String value) {
        if (value == null) return null;
        return switch (value) {
            case "RECHAZADO_A_PROFESOR" -> RECHAZADO_A_DOCENTE;
            case "COMPLETO_POR_ADMINISTRACION" -> PENDIENTE_DE_SECRETARIA_INICIAL;
            case "COMPLETO_POR_SECRETARIA" -> PENDIENTE_DE_DOCENTE;
            case "COMPLETO_POR_PROFESOR", "COMPLETO_POR_DOCENTE" -> PENDIENTE_DE_COMISIONES_CURRICULARES;
            case "APROBADO_POR_COMISION" -> PENDIENTE_DE_SECRETARIA_FINAL;
            case "APROBADO_POR_SECRETARIA" -> APROBADO;
            default -> valueOf(value);
        };
    }
}

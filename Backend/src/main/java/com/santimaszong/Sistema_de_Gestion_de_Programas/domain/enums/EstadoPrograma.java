package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums;

public enum EstadoPrograma {
    // Le aparecen pendientes a Administrativo
    INCOMPLETO_POR_ADMINISTRACION,               // administrativo creo y no cargo todos los datos
    RECHAZADO_A_ADMINISTRACION,                  // rechazado

    // Le aparecen pendientes a Profesor
    COMPLETO_POR_ADMINISTRACION,                 // administrativo creo y cargo todos los datos
    INCOMPLETO_POR_PROFESOR,                     // profesor no cargo todos los datos
    RECHAZADO_A_PROFESOR,                        // rechazado

    // Le aparecen pendientes a Coordinador
    COMPLETO_POR_PROFESOR,                       // profesor cargo todos los datos

    // Le aparecen pendientes a Secretario
    APROBADO_POR_COMISION,                       // coordinador aprobo

    // Final
    APROBADO_POR_SECRETARIA,                     // secretaria aprueba
}
package com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception;

/** Mensaje de validación de negocio apto para presentar al usuario. */
public class ValidacionProgramaException extends IllegalArgumentException {
    public ValidacionProgramaException(String mensaje) {
        super(mensaje);
    }
}

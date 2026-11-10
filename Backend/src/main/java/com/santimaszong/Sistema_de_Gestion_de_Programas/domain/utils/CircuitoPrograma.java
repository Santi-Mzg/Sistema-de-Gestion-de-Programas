package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.utils;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import java.util.Set;

/** Reglas del circuito independientes de persistencia, correo y formularios. */
public final class CircuitoPrograma {
    private CircuitoPrograma() {}

    public static boolean esSecretariaInicial(EstadoPrograma estado) {
        return estado == EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL
                || estado == EstadoPrograma.RECHAZADO_A_SECRETARIA;
    }

    public static boolean esCargaDocente(EstadoPrograma estado) {
        return estado == EstadoPrograma.PENDIENTE_DE_DOCENTE
                || estado == EstadoPrograma.RECHAZADO_A_DOCENTE;
    }

    public static void validarRevision(EstadoPrograma estado, Rol rol) {
        boolean permitido = switch (rol) {
            case SECRETARIA -> esSecretariaInicial(estado)
                    || estado == EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL;
            case DOCENTE -> esCargaDocente(estado);
            case COORDINADOR_AREA -> estado == EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA;
            case COORDINACION_COMISION_CURRICULAR -> estado == EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES;
            default -> false;
        };
        if (!permitido) throw new IllegalStateException("El programa ya no está pendiente de esta etapa");
    }

    public static boolean puedeRechazarA(EstadoPrograma actual, Rol actor, Rol destino) {
        validarRevision(actual, actor);
        Set<Rol> permitidos = switch (actor) {
            case DOCENTE -> Set.of(Rol.ADMINISTRACION, Rol.SECRETARIA);
            case SECRETARIA -> esSecretariaInicial(actual)
                    ? Set.of(Rol.ADMINISTRACION)
                    : Set.of(Rol.ADMINISTRACION, Rol.SECRETARIA, Rol.DOCENTE);
            case COORDINADOR_AREA, COORDINACION_COMISION_CURRICULAR ->
                    Set.of(Rol.ADMINISTRACION, Rol.SECRETARIA, Rol.DOCENTE);
            default -> Set.of();
        };
        return destino != null && permitidos.contains(destino);
    }

    public static EstadoPrograma destinoRechazo(EstadoPrograma actual, Rol actor, Rol destino) {
        if (!puedeRechazarA(actual, actor, destino)) {
            throw new IllegalArgumentException("El destino de rechazo no está permitido para esta etapa");
        }
        return switch (destino) {
            case ADMINISTRACION -> EstadoPrograma.RECHAZADO_A_ADMINISTRACION;
            case SECRETARIA -> EstadoPrograma.RECHAZADO_A_SECRETARIA;
            case DOCENTE -> EstadoPrograma.RECHAZADO_A_DOCENTE;
            default -> throw new IllegalArgumentException("Destino inválido");
        };
    }

    public static EstadoPrograma siguienteEnvioDocente(boolean tieneCoordinador) {
        return tieneCoordinador ? EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA
                : EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES;
    }
}

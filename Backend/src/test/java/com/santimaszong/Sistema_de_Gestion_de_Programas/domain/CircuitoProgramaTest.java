package com.santimaszong.Sistema_de_Gestion_de_Programas.domain;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.utils.CircuitoPrograma;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class CircuitoProgramaTest {
    @Test void docenteSoloDevuelveAAdministracionOSecretaria() {
        assertThat(CircuitoPrograma.destinoRechazo(EstadoPrograma.PENDIENTE_DE_DOCENTE, Rol.DOCENTE, Rol.SECRETARIA))
                .isEqualTo(EstadoPrograma.RECHAZADO_A_SECRETARIA);
        assertThatThrownBy(() -> CircuitoPrograma.destinoRechazo(EstadoPrograma.PENDIENTE_DE_DOCENTE, Rol.DOCENTE, Rol.DOCENTE))
                .isInstanceOf(IllegalArgumentException.class);
    }
    @Test void secretariaInicialSoloDevuelveAAdministracion() {
        assertThatThrownBy(() -> CircuitoPrograma.destinoRechazo(EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL, Rol.SECRETARIA, Rol.DOCENTE))
                .isInstanceOf(IllegalArgumentException.class);
    }
    @Test void secretariaFinalNoPuedeOmitirComisiones() {
        assertThatThrownBy(() -> CircuitoPrograma.validarRevision(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, Rol.SECRETARIA))
                .isInstanceOf(IllegalStateException.class);
    }
    @Test void areaPermiteLosTresDestinosDeCorreccion() {
        for (Rol destino : new Rol[]{Rol.ADMINISTRACION, Rol.SECRETARIA, Rol.DOCENTE})
            assertThat(CircuitoPrograma.destinoRechazo(EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA, Rol.COORDINADOR_AREA, destino)).isNotNull();
    }
    @Test void docenteEnviaAAreaSoloSiTieneCoordinador() {
        assertThat(CircuitoPrograma.siguienteEnvioDocente(true)).isEqualTo(EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA);
        assertThat(CircuitoPrograma.siguienteEnvioDocente(false)).isEqualTo(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES);
    }
    @Test void unProgramaAprobadoNoAdmiteOtraDecision() {
        for (Rol rol : Rol.values()) assertThatThrownBy(() -> CircuitoPrograma.validarRevision(EstadoPrograma.APROBADO, rol))
                .isInstanceOf(IllegalStateException.class);
    }
}

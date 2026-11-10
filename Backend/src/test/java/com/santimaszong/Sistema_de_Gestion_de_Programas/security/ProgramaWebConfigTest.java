package com.santimaszong.Sistema_de_Gestion_de_Programas.security;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import org.junit.jupiter.api.Test;
import org.springframework.core.convert.ConversionFailedException;
import org.springframework.format.support.DefaultFormattingConversionService;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.mock;

class ProgramaWebConfigTest {
    @Test
    void conversorWebAceptaEstadosAnterioresYActualesPeroRechazaDesconocidos() {
        var conversion = new DefaultFormattingConversionService();
        new ProgramaWebConfig(mock(ProgramaContextInterceptor.class)).addFormatters(conversion);
        assertThat(conversion.convert("COMPLETO_POR_PROFESOR", EstadoPrograma.class))
                .isEqualTo(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES);
        assertThat(conversion.convert("PENDIENTE_DE_COMISIONES_CURRICULARES", EstadoPrograma.class))
                .isEqualTo(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES);
        assertThat(conversion.convert("COMPLETO_POR_DOCENTE", EstadoPrograma.class))
                .isEqualTo(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES);
        assertThat(conversion.convert("COMPLETO_POR_ADMINISTRACION", EstadoPrograma.class))
                .isEqualTo(EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL);
        assertThat(conversion.convert("COMPLETO_POR_SECRETARIA", EstadoPrograma.class))
                .isEqualTo(EstadoPrograma.PENDIENTE_DE_DOCENTE);
        assertThat(conversion.convert("APROBADO_POR_COMISION", EstadoPrograma.class))
                .isEqualTo(EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL);
        assertThat(conversion.convert("APROBADO_POR_SECRETARIA", EstadoPrograma.class))
                .isEqualTo(EstadoPrograma.APROBADO);
        assertThatThrownBy(() -> conversion.convert("ESTADO_DESCONOCIDO", EstadoPrograma.class))
                .isInstanceOf(ConversionFailedException.class);
    }
}

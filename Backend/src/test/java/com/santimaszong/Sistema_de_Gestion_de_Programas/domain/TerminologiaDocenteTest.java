package com.santimaszong.Sistema_de_Gestion_de_Programas.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.converters.EstadoProgramaConverter;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TerminologiaDocenteTest {

    @Test
    void leeEstadosHistoricosYEscribeLosNombresActuales() {
        EstadoProgramaConverter converter = new EstadoProgramaConverter();
        assertThat(converter.convertToEntityAttribute("COMPLETO_POR_PROFESOR"))
                .isEqualTo(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES);
        assertThat(converter.convertToEntityAttribute("RECHAZADO_A_PROFESOR"))
                .isEqualTo(EstadoPrograma.RECHAZADO_A_DOCENTE);
        assertThat(converter.convertToDatabaseColumn(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES))
                .isEqualTo("PENDIENTE_DE_COMISIONES_CURRICULARES");
        assertThat(converter.convertToEntityAttribute(null)).isNull();
    }

    @Test
    void jsonAceptaLosAliasHistoricosPeroDevuelveElNombreActual() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        String[] anteriores = {"RECHAZADO_A_PROFESOR", "COMPLETO_POR_PROFESOR",
                "COMPLETO_POR_ADMINISTRACION", "COMPLETO_POR_SECRETARIA", "COMPLETO_POR_DOCENTE",
                "APROBADO_POR_COMISION", "APROBADO_POR_SECRETARIA"};
        EstadoPrograma[] actuales = {EstadoPrograma.RECHAZADO_A_DOCENTE, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES,
                EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL, EstadoPrograma.PENDIENTE_DE_DOCENTE,
                EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL,
                EstadoPrograma.APROBADO};
        for (int i = 0; i < anteriores.length; i++) {
            assertThat(mapper.readValue("\"" + anteriores[i] + "\"", EstadoPrograma.class)).isEqualTo(actuales[i]);
            assertThat(mapper.writeValueAsString(actuales[i])).isEqualTo("\"" + actuales[i].name() + "\"");
            var converter = new EstadoProgramaConverter();
            assertThat(converter.convertToEntityAttribute(anteriores[i])).isEqualTo(actuales[i]);
            assertThat(converter.convertToDatabaseColumn(actuales[i])).isEqualTo(actuales[i].name());
        }
        for (EstadoPrograma estado : EstadoPrograma.values()) {
            assertThat(EstadoPrograma.fromValue(estado.name())).isEqualTo(estado);
        }
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> EstadoPrograma.fromValue("ESTADO_DESCONOCIDO"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"INCOMPLETO_POR_ADMINISTRACION", "INCOMPLETO_POR_DOCENTE", "INCOMPLETO_POR_PROFESOR"})
    void rechazaEstadosIncompletosEliminadosDelModelo(String estado) {
        assertThatThrownBy(() -> EstadoPrograma.fromValue(estado)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new EstadoProgramaConverter().convertToEntityAttribute(estado))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new ObjectMapper().readValue("\"" + estado + "\"", EstadoPrograma.class))
                .isInstanceOf(com.fasterxml.jackson.databind.JsonMappingException.class);
    }

    @Test
    void aceptaElNombreAnteriorDelResponsableYSerializaDocente() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ProgramaCargaDTO datos = mapper.readValue("{\"profesorResponsableId\":42}", ProgramaCargaDTO.class);
        assertThat(datos.getDocenteResponsableId()).isEqualTo(42L);
        var json = mapper.readTree(mapper.writeValueAsString(datos));
        assertThat(json.get("docenteResponsableId").asLong()).isEqualTo(42L);
        assertThat(json.has("profesorResponsableId")).isFalse();
    }
}

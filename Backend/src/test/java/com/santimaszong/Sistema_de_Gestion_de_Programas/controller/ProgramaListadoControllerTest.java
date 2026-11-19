package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaBorradorService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ai.formatterAPA.BibliografiaFormatterService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.pdf.PdfGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

class ProgramaListadoControllerTest {
    private ProgramaService servicio;
    private MockMvc mvc;
    private final Authentication auth = new UsernamePasswordAuthenticationToken("persona-prueba", null);

    @BeforeEach
    void preparar() {
        servicio = mock(ProgramaService.class);
        mvc = MockMvcBuilders.standaloneSetup(new ProgramaController(servicio, mock(PdfGeneratorService.class),
                mock(BibliografiaFormatterService.class), mock(ProgramaBorradorService.class))).build();
        when(servicio.getListPorAnio(any(), anyLong(), any(), nullable(Integer.class), any(), any(), any()))
                .thenReturn(Page.empty(PageRequest.of(0, 10)));
        when(servicio.getListPorAnioCoordinador(any(), anyLong(), any(), nullable(Integer.class), any(), any(), any(), any()))
                .thenReturn(Page.empty(PageRequest.of(0, 10)));
    }

    @ParameterizedTest
    @EnumSource(Rol.class)
    void consultaAniosPorDepartamentoYRolActivo(Rol rol) throws Exception {
        int anio = LocalDate.now().getYear();
        when(servicio.getAniosDisponibles(auth, 6L, rol)).thenReturn(List.of(anio, anio - 1));
        mvc.perform(get("/api/departamentos/6/programas/anios").principal(auth).param("rolActivo", rol.name()))
                .andExpect(status().isOk()).andExpect(content().json("[" + anio + "," + (anio - 1) + "]"));
        verify(servicio).getAniosDisponibles(auth, 6L, rol);
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void recibeAnioOpcionalSinCambiarElEndpoint(boolean coordinacion) throws Exception {
        String recurso = coordinacion ? "programas-coordinacion" : "programas";
        Rol rol = coordinacion ? Rol.COORDINACION_COMISION_CURRICULAR : Rol.ADMINISTRACION;
        mvc.perform(get("/api/departamentos/6/" + recurso).principal(auth).param("rolActivo", rol.name())
                .param("anio", "2024")).andExpect(status().isOk());
        if (coordinacion) verify(servicio).getListPorAnioCoordinador(eq(auth), eq(6L), eq(rol), eq(2024), isNull(), isNull(), isNull(), any());
        else verify(servicio).getListPorAnio(eq(auth), eq(6L), eq(rol), eq(2024), isNull(), isNull(), any());
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void permiteOmitirAnioParaConservarElComportamientoActual(boolean coordinacion) throws Exception {
        String recurso = coordinacion ? "programas-coordinacion" : "programas";
        Rol rol = coordinacion ? Rol.COORDINACION_COMISION_CURRICULAR : Rol.ADMINISTRACION;
        mvc.perform(get("/api/departamentos/6/" + recurso).principal(auth).param("rolActivo", rol.name()))
                .andExpect(status().isOk());
        if (coordinacion) verify(servicio).getListPorAnioCoordinador(eq(auth), eq(6L), eq(rol), isNull(), isNull(), isNull(), isNull(), any());
        else verify(servicio).getListPorAnio(eq(auth), eq(6L), eq(rol), isNull(), isNull(), isNull(), any());
    }
}

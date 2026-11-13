package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.ContextoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.ProgramaContextInterceptor;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaBorradorService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ai.formatterAPA.BibliografiaFormatterService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.pdf.PdfGeneratorService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.GlobalExceptionHandler;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.ValidacionProgramaException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProgramaPdfControllerTest {
    private MockMvc mvc;
    private PdfGeneratorService pdfService;
    private ContextoPrograma contexto;
    private ProgramaEntity programa;

    @BeforeEach
    void preparar() {
        pdfService = mock(PdfGeneratorService.class);
        contexto = mock(ContextoPrograma.class);
        var repository = mock(ProgramaRepository.class);
        programa = new ProgramaEntity(); programa.setId(12L); programa.setEstadoActual(EstadoPrograma.APROBADO);
        when(repository.findById(12L)).thenReturn(Optional.of(programa));
        when(contexto.exigir(eq("100"), eq(6L), any(Rol.class))).thenReturn(new UsuarioDepartamentoEntity());
        when(pdfService.generarPdf(eq(12L), any())).thenReturn("%PDF-prueba".getBytes(StandardCharsets.US_ASCII));
        var controller = new ProgramaController(mock(ProgramaService.class), pdfService,
                mock(BibliografiaFormatterService.class), mock(ProgramaBorradorService.class));
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .addInterceptors(new ProgramaContextInterceptor(contexto, repository, mock(AreaRepository.class), mock(MateriaRepository.class)))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("100", null, List.of()));
    }

    @AfterEach
    void limpiar() { SecurityContextHolder.clearContext(); }

    private MockHttpServletRequestBuilder peticion(Rol rol) {
        return get("/api/programas/12/pdf").header("X-Departamento-Activo", "6").header("X-Rol-Activo", rol.name());
    }

    @ParameterizedTest
    @EnumSource(value = Rol.class, names = {"SECRETARIA", "SYSTEM_ADMIN"})
    void conservaElPdfCompletoParaRolesPermitidos(Rol rol) throws Exception {
        mvc.perform(peticion(rol)).andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", containsString("inline")));
        verify(pdfService).generarPdf(12L, null);
        verify(contexto).consultar(eq(programa), any(), eq(rol));
    }

    @Test
    void recibeLaSeleccionMultipleSinCambiarLaRuta() throws Exception {
        mvc.perform(peticion(Rol.SECRETARIA).param("planIds", "8,9"))
                .andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_PDF));
        verify(pdfService).generarPdf(12L, List.of(8L, 9L));
    }

    @Test
    void seleccionAjenaDevuelveUnMensajeDeValidacionComprensible() throws Exception {
        when(pdfService.generarPdf(12L, List.of(999L)))
                .thenThrow(new ValidacionProgramaException("Los planes seleccionados deben pertenecer al programa"));
        mvc.perform(peticion(Rol.SECRETARIA).param("planIds", "999")).andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Los planes seleccionados deben pertenecer al programa")));
    }

    @Test
    void seleccionExplicitaVaciaNoSeInterpretaComoTodos() throws Exception {
        when(pdfService.generarPdf(12L, List.of()))
                .thenThrow(new ValidacionProgramaException("Seleccione al menos un plan válido para generar el PDF"));
        mvc.perform(peticion(Rol.SECRETARIA).param("planIds", "")).andExpect(status().isBadRequest());
        verify(pdfService).generarPdf(12L, List.of());
    }

    @Test
    void identificadorNoNumericoDevuelve400SinGenerar() throws Exception {
        mvc.perform(peticion(Rol.SECRETARIA).param("planIds", "invalido")).andExpect(status().isBadRequest());
        verify(pdfService, never()).generarPdf(anyLong(), any());
    }

    @ParameterizedTest
    @EnumSource(value = Rol.class, names = {"SECRETARIA", "SYSTEM_ADMIN"}, mode = EnumSource.Mode.EXCLUDE)
    void otrosRolesNoPuedenGenerarAunqueEnvienPlanes(Rol rol) throws Exception {
        mvc.perform(peticion(rol).param("planIds", "8")).andExpect(status().isForbidden());
        verify(pdfService, never()).generarPdf(anyLong(), any());
    }

    @ParameterizedTest
    @EnumSource(value = EstadoPrograma.class, names = "APROBADO", mode = EnumSource.Mode.EXCLUDE)
    void programasNoAprobadosNoSeExportan(EstadoPrograma estado) throws Exception {
        programa.setEstadoActual(estado);
        mvc.perform(peticion(Rol.SECRETARIA).param("planIds", "8")).andExpect(status().isForbidden());
        verify(pdfService, never()).generarPdf(anyLong(), any());
    }

    @Test
    void conservaElControlDeAccesoAlPrograma() throws Exception {
        doThrow(new AccessDeniedException("El programa no pertenece al departamento activo"))
                .when(contexto).consultar(eq(programa), any(), eq(Rol.SECRETARIA));
        mvc.perform(peticion(Rol.SECRETARIA).param("planIds", "8")).andExpect(status().isForbidden());
        verify(pdfService, never()).generarPdf(anyLong(), any());
    }
}

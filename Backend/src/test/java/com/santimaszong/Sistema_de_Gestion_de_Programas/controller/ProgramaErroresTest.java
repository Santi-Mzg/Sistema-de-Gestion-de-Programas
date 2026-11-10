package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.*;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProgramaErroresTest {
    private MockMvc mvc;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.standaloneSetup(new RecursoPrueba())
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void validacionDevuelve400ConElMensajeDeNegocio() throws Exception {
        mvc.perform(get("/prueba/validacion"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("La justificación es obligatoria")));
    }

    @Test
    void conflictoDevuelve409ConElMensajeDeNegocio() throws Exception {
        mvc.perform(get("/prueba/conflicto"))
                .andExpect(status().isConflict())
                .andExpect(content().string(containsString("Ya existe un programa")));
    }

    @Test
    void estadoInvalidoConservaEl400Existente() throws Exception {
        mvc.perform(get("/prueba/estado"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("El programa ya no está pendiente")));
    }

    @Test
    void errorInesperadoNoExponeElDetalleInterno() throws Exception {
        mvc.perform(get("/prueba/interno"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(not(containsString("detalle interno de prueba"))));
    }

    @RestController
    static class RecursoPrueba {
        @GetMapping("/prueba/{tipo}")
        public void ejecutar(@PathVariable String tipo) {
            switch (tipo) {
                case "validacion" -> throw new ValidacionProgramaException("La justificación es obligatoria");
                case "conflicto" -> throw new ConflictoProgramaException("Ya existe un programa");
                case "estado" -> throw new IllegalStateException("El programa ya no está pendiente");
                default -> throw new RuntimeException("detalle interno de prueba");
            }
        }
    }
}

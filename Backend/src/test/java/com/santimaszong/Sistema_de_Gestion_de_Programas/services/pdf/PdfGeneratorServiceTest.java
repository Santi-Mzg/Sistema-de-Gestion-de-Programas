package com.santimaszong.Sistema_de_Gestion_de_Programas.services.pdf;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.ProgramaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.ValidacionProgramaException;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.util.StringUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.IContext;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PdfGeneratorServiceTest {
    private ProgramaRepository repository;
    private TemplateEngine templateEngine;
    private PdfGeneratorService service;
    private ProgramaEntity programa;
    private ProgramaCarreraEntity primero;
    private ProgramaCarreraEntity segundo;
    private ProgramaCarreraEntity tercero;

    @BeforeEach
    void preparar() {
        repository = mock(ProgramaRepository.class);
        templateEngine = mock(TemplateEngine.class);
        service = new PdfGeneratorService(templateEngine, repository);
        programa = new ProgramaEntity();
        programa.setId(12L);
        primero = bloque(8L, "Ingenieria", "2024", 1, "CONTRIBUCION_PRIMER_PLAN");
        segundo = bloque(9L, "Ingenieria", "2024", 2, "CONTRIBUCION_SEGUNDO_PLAN");
        tercero = bloque(10L, "Licenciatura", "2025", 1, "CONTRIBUCION_TERCER_PLAN");
        programa.getBloqueMultiple().addAll(List.of(primero, segundo, tercero));
        when(repository.findById(12L)).thenReturn(Optional.of(programa));
    }

    private ProgramaCarreraEntity bloque(Long planId, String nombre, String anio, int version, String contribucion) {
        var carrera = new CarreraEntity(); carrera.setNombre(nombre);
        var plan = new CarreraPlanEntity();
        plan.setId(planId); plan.setCarrera(carrera); plan.setAnio(anio); plan.setVersion(version);
        var bloque = new ProgramaCarreraEntity();
        bloque.setPrograma(programa); bloque.setCarreraPlan(plan);
        bloque.setUbicacionEnPlan("Primer anio"); bloque.setContribucion(contribucion);
        return bloque;
    }

    private IContext generar(List<Long> ids) {
        when(templateEngine.process(eq("pdf/programa"), any(IContext.class)))
                .thenReturn("<html><head><title>Programa</title></head><body>Programa de prueba</body></html>");
        byte[] pdf = service.generarPdf(12L, ids);
        assertThat(new String(pdf, 0, 4, StandardCharsets.US_ASCII)).isEqualTo("%PDF");
        var captor = ArgumentCaptor.forClass(IContext.class);
        verify(templateEngine).process(eq("pdf/programa"), captor.capture());
        return captor.getValue();
    }

    @Test
    void sinFiltroIncluyeTodosLosPlanes() {
        assertThat(generar(null).getVariable("bloquesPdf")).isEqualTo(List.of(primero, segundo, tercero));
    }

    @Test
    void filtraPorPlanAunqueDosPlanesSeanDeLaMismaCarrera() {
        assertThat(generar(List.of(9L)).getVariable("bloquesPdf")).isEqualTo(List.of(segundo));
        assertThat(programa.getBloqueMultiple()).containsExactly(primero, segundo, tercero);
        verify(repository, never()).save(any());
    }

    @Test
    void admiteVariosPlanesYConservaElOrdenDelProgramaSinDuplicarBloques() {
        assertThat(generar(List.of(10L, 8L, 8L)).getVariable("bloquesPdf")).isEqualTo(List.of(primero, tercero));
        assertThat(programa.getBloqueMultiple()).containsExactly(primero, segundo, tercero);
    }

    @Test
    void rechazaUnPlanAjenoAunqueTambienHayaPlanesValidos() {
        assertThatThrownBy(() -> service.generarPdf(12L, List.of(8L, 999L)))
                .isInstanceOf(ValidacionProgramaException.class).hasMessageContaining("pertenecer al programa");
        verifyNoInteractions(templateEngine);
        assertThat(programa.getBloqueMultiple()).containsExactly(primero, segundo, tercero);
    }

    @Test
    void rechazaSeleccionVaciaOIdentificadoresInvalidos() {
        for (List<Long> ids : List.of(List.<Long>of(), List.of(0L), List.of(-1L), Arrays.asList(8L, null))) {
            assertThatThrownBy(() -> service.generarPdf(12L, ids)).isInstanceOf(ValidacionProgramaException.class);
        }
        verifyNoInteractions(templateEngine);
    }

    @Test
    void programaInexistenteConservaElErrorDeRecursoNoEncontrado() {
        when(repository.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.generarPdf(999L, null)).isInstanceOf(EntityNotFoundException.class);
        verifyNoInteractions(templateEngine);
    }

    @Test
    void plantillaRealGeneraPdfConLosPlanesFiltradosYContenidosMinimosEnBloqueUnico() {
        var departamento = new DepartamentoEntity(); departamento.setNombre("Ciencias");
        var area = new AreaEntity(); area.setNombre("Matematica");
        var materia = new MateriaEntity();
        materia.setNombre("Algebra"); materia.setCodigo("ALG"); materia.setDepartamento(departamento); materia.setArea(area);
        programa.setMateria(materia); programa.setAnio(2026);
        programa.setCargaHorariaTotal(64); programa.setCargaHorariaPractica(32);
        programa.setCargaHorariaSemanal(4); programa.setCantidadSemanas(16); programa.setCreditos(6);
        programa.setObjetivos("OBJETIVOS_UNICOS"); programa.setContenidosMinimos("MINIMOS_UNICOS");
        programa.setProgramaAnalitico("ANALITICO_UNICO");

        var resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/"); resolver.setSuffix(".html"); resolver.setCharacterEncoding("UTF-8");
        var motorReal = new SpringTemplateEngine(); motorReal.setTemplateResolver(resolver);
        var htmlGenerado = new AtomicReference<String>();
        when(templateEngine.process(eq("pdf/programa"), any(IContext.class))).thenAnswer(invocation -> {
            String html = motorReal.process(invocation.getArgument(0, String.class), invocation.getArgument(1, IContext.class));
            htmlGenerado.set(html);
            return html;
        });

        byte[] pdf = service.generarPdf(12L, List.of(8L, 10L));

        assertThat(new String(pdf, 0, 4, StandardCharsets.US_ASCII)).isEqualTo("%PDF");
        assertThat(htmlGenerado.get()).contains("CONTRIBUCION_PRIMER_PLAN", "CONTRIBUCION_TERCER_PLAN")
                .doesNotContain("CONTRIBUCION_SEGUNDO_PLAN");
        assertThat(StringUtils.countOccurrencesOf(htmlGenerado.get(), "MINIMOS_UNICOS")).isEqualTo(1);
        assertThat(htmlGenerado.get().indexOf("MINIMOS_UNICOS")).isGreaterThan(htmlGenerado.get().indexOf("OBJETIVOS_UNICOS"))
                .isLessThan(htmlGenerado.get().indexOf("ANALITICO_UNICO"));
        assertThat(programa.getBloqueMultiple()).containsExactly(primero, segundo, tercero);
    }
}

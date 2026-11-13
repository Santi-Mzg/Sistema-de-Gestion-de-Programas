package com.santimaszong.Sistema_de_Gestion_de_Programas.services.pdf;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaCarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.ProgramaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.ValidacionProgramaException;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.HashSet;
import java.util.List;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

@Service
public class PdfGeneratorService {

    private final TemplateEngine templateEngine;
    private final ProgramaRepository programaRepository;

    public PdfGeneratorService(TemplateEngine templateEngine, ProgramaRepository programaRepository) {
        this.templateEngine = templateEngine;
        this.programaRepository = programaRepository;
    }

    /** Genera el documento completo si planIds es null; una lista explícita debe contener planes del programa. */
    @Transactional(readOnly = true)
    public byte[] generarPdf(Long programaId, List<Long> planIds) {
        ProgramaEntity programa = programaRepository.findById(programaId)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        Context context = new Context();
        context.setVariable("programa", programa);
        context.setVariable("bloquesPdf", seleccionarBloques(programa, planIds));

        String htmlContent = templateEngine.process("pdf/programa", context);

        String baseUrl = this.getClass()
                .getClassLoader()
                .getResource("pdf/")
                .toExternalForm();

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent, baseUrl);
            renderer.layout();
            renderer.createPDF(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF", e);
        }
    }

    private List<ProgramaCarreraEntity> seleccionarBloques(ProgramaEntity programa, List<Long> planIds) {
        if (planIds == null) return programa.getBloqueMultiple();
        if (planIds.isEmpty() || planIds.stream().anyMatch(id -> id == null || id <= 0)) {
            throw new ValidacionProgramaException("Seleccione al menos un plan válido para generar el PDF");
        }

        var seleccion = new HashSet<>(planIds);
        var bloques = programa.getBloqueMultiple().stream()
                .filter(bloque -> seleccion.contains(bloque.getCarreraPlan().getId()))
                .toList();
        var encontrados = new HashSet<Long>();
        bloques.forEach(bloque -> encontrados.add(bloque.getCarreraPlan().getId()));
        if (!encontrados.containsAll(seleccion)) {
            throw new ValidacionProgramaException("Los planes seleccionados deben pertenecer al programa");
        }
        return bloques;
    }
}

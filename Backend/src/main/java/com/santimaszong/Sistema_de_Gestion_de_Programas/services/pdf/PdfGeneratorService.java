package com.santimaszong.Sistema_de_Gestion_de_Programas.services.pdf;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.ProgramaRepository;
import jakarta.persistence.Column;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
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

    public byte[] generarPdf(Long programaId) {
        ProgramaEntity programa = programaRepository.findById(programaId)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        Context context = new Context();
        context.setVariable("programa", programa);

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
}
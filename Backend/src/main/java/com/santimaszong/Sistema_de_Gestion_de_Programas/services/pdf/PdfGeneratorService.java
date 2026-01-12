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
        context.setVariable("p", programa);

//        context.setVariable("departamento", programa.getMateria().getDepartamento().getNombre());
//        context.setVariable("anio", programa.getAnio());
//        context.setVariable("nombreMateria", programa.getMateria().getNombre());
//        context.setVariable("codigoMateria", programa.getMateria().getCodigo());
//        context.setVariable("profesorResponsable", programa.getProfesorResponsable().getUsuario().getApellido() +", "+programa.getProfesorResponsable().getUsuario().getNombre());
//        context.setVariable("cargaHorariaTotal", programa.getCargaHorariaTotal());
//        context.setVariable("cargaHorariaSemanal", programa.getCargaHorariaSemanal());
//        context.setVariable("cargaHorariaPractica", programa.getCargaHorariaPractica());
//        context.setVariable("creditos", programa.getCreditos());
//        context.setVariable("cantidadSemanas", programa.getCantidadSemanas());
//        context.setVariable("fundamentacion", programa.getFundamentacion());
//        context.setVariable("objetivos", programa.getObjetivos());
//        context.setVariable("programaAnalitico", programa.getProgramaAnalitico());
//        context.setVariable("metodologia", programa.getMetodologia());
//        context.setVariable("modalidadEvaluacion", programa.getModalidadEvaluacion());
//        context.setVariable("bibliografia", programa.getBibliografia());
//
//        context.setVariable("bloqueMultiple", programa.getBloqueMultiple());


        String htmlContent = templateEngine.process("pdf/programa", context);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF", e);
        }
    }
}
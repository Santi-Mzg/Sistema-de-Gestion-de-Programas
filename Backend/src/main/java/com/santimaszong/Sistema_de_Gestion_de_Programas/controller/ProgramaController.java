package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.gemini.GeminiService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.pdf.PdfGeneratorService;
import lombok.extern.java.Log;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Log
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProgramaController {

    private final ProgramaService programaService;
    private final PdfGeneratorService pdfService;
    private final GeminiService geminiService;

    public ProgramaController(ProgramaService programaService, PdfGeneratorService pdfService, GeminiService geminiService) {
        this.programaService = programaService;
        this.pdfService = pdfService;
        this.geminiService = geminiService;
    }

    @PostMapping("/departamentos/{deptId}/programas")
    public ResponseEntity<ProgramaResponseDTO> createPrograma(@PathVariable Long deptId,
                                                              @RequestBody ProgramaCargaDTO program,
                                                              @AuthenticationPrincipal UserEntity actor) {
        ProgramaResponseDTO createdProgram = programaService.create(deptId, program, actor);

        return new ResponseEntity<>(createdProgram, HttpStatus.CREATED);
    }

    @PatchMapping("/departamentos/{deptId}/programas/{id}/administrativo-carga")
    public ResponseEntity<ProgramaResponseDTO> administrativoCarga(@PathVariable Long deptId,
                                                                   @PathVariable Long id,
                                                                   @RequestBody ProgramaCargaDTO program,
                                                                   @AuthenticationPrincipal UserEntity actor) {
        ProgramaResponseDTO updatedProgram = programaService.administrativoCarga(deptId, id, program, actor);

        return new ResponseEntity<>(updatedProgram, HttpStatus.OK);
    }

    // PROFESOR carga sus datos
    @PatchMapping("/departamentos/{deptId}/programas/{id}/profesor-carga")
    public ResponseEntity<ProgramaResponseDTO> profesorCarga(@PathVariable Long deptId,
                                                             @PathVariable Long id,
                                                             @RequestBody ProgramaCargaDTO programaDTO,
                                                             @AuthenticationPrincipal UserEntity actor) {

        return ResponseEntity.ok(programaService.profesorCarga(deptId, id, programaDTO, actor));
    }

    @PatchMapping("/departamentos/{deptId}/programas/{id}/estado")
    public ResponseEntity<ProgramaResponseDTO> actualizarEstado(@PathVariable Long deptId,
                                                                @PathVariable Long id,
                                                                @RequestBody EstadoUpdateDTO estadoUpdateDTO,
                                                                @RequestParam(required = false) Long carreraId,
                                                                @RequestParam Rol rolActivo,
                                                                Authentication auth) {

        return ResponseEntity.ok(programaService.actualizarEstado(auth, deptId, carreraId, id, estadoUpdateDTO, rolActivo));
    }



    @GetMapping("/programas/{id}")
    public ResponseEntity<ProgramaResponseDTO> getPrograma(@PathVariable Long id) {
        ProgramaResponseDTO foundProgram = programaService.getById(id);

        return ResponseEntity.ok(foundProgram);
    }

    @GetMapping("/materias/{materiaId}/programa-anio")
    public ResponseEntity<ProgramaResponseDTO> getProgramaMateriaAnio(
            @PathVariable Long materiaId
    ) {
        ProgramaResponseDTO foundProgram = programaService.getByMateriaIdAndAnio(materiaId);

        return ResponseEntity.ok(foundProgram);
    }

    @GetMapping("/materias/{materiaId}/programa-vigente")
    public ResponseEntity<ProgramaResponseDTO> getProgramaVigente(
            @PathVariable Long materiaId
    ) {
        ProgramaResponseDTO foundProgram = programaService.getProgramaVigenteByMateria(materiaId);

        return ResponseEntity.ok(foundProgram);
    }

    @GetMapping("/materias/{materiaId}/programas")
    public List<ProgramaResponseReducedDTO> listProgramasMateria(
            @PathVariable Long materiaId
    ) {
        return programaService.getListByMateria(materiaId);
    }

    @GetMapping("/departamentos/{deptId}/programas")
    public List<ProgramaResponseReducedDTO> listProgramas(
            @PathVariable Long deptId,
            @RequestParam Rol rolActivo,
            Authentication auth
    ) {
        return programaService.getListAnioActual(auth, deptId, rolActivo);
    }

    @GetMapping("/departamentos/{deptId}/programas-coordinacion")
    public List<ProgramaResponseDTO> listProgramasCoordinacion(
            @PathVariable Long deptId,
            @RequestParam Rol rolActivo,
            Authentication auth
    ) {
        return programaService.getListAnioActualCoordinador(auth, deptId, rolActivo);
    }

    @GetMapping("/departamentos/{deptId}/programas/pendientes")
    public List<ProgramaResponseReducedDTO> listProgramasPendientes(
            @PathVariable Long deptId,
            @RequestParam Rol rolActivo,
            Authentication auth
    ) {
        return programaService.getListPendientes(auth, deptId, rolActivo);
    }

    @GetMapping("/departamentos/{deptId}/programas-coordinacion/pendientes")
    public List<ProgramaResponseDTO> listProgramasPendientesCoordinador(
            @PathVariable Long deptId,
            @RequestParam Rol rolActivo,
            Authentication auth
    ) {
        return programaService.getListPendientesCoordinador(auth, deptId, rolActivo);
    }


    @DeleteMapping("/programas/{id}")
    public ResponseEntity<Void> deletePrograma(@PathVariable Long id) {
        programaService.delete(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }




    // BORRADOR
    @PostMapping("/departamentos/{deptId}/programas/draft/{materiaId}")
    public ResponseEntity<Void> saveDraft(
            @PathVariable Long deptId,
            @PathVariable Long materiaId,
            @RequestParam Rol rolActivo,
            @RequestBody ProgramaDraftDTO dto,
            @AuthenticationPrincipal UserEntity user
    ) {
        programaService.saveDraft(deptId, materiaId, dto, user, rolActivo);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/departamentos/{deptId}/programas/draft/{materiaId}")
    public ProgramaDraftDTO getDraft(
            @PathVariable Long deptId,
            @PathVariable Long materiaId,
            @RequestParam Rol rolActivo,
            @AuthenticationPrincipal UserEntity user
    ) {
        return programaService.getDraft(deptId, materiaId, user, rolActivo);
    }

    @DeleteMapping("/departamentos/{deptId}/programas/draft/{materiaId}")
    public ResponseEntity<Void> deleteDraft(
            @PathVariable Long deptId,
            @PathVariable Long materiaId,
            @RequestParam Rol rolActivo,
            @AuthenticationPrincipal UserEntity user
    ) {
        programaService.deleteDraft(deptId, materiaId, user, rolActivo);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }




    // PDF
    @GetMapping("/programas/{id}/pdf")
    public ResponseEntity<byte[]> generarPDF(@PathVariable Long id) {
        byte[] pdf = pdfService.generarPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.inline().filename("programa.pdf").build()
        );

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }




    //GEMINI
    @PostMapping("/programas/formatear-apa")
    public ResponseEntity<String> formatearAPA(@RequestBody String bibliografia) {
        String resultado = geminiService.formatearABibliografiaAPA(bibliografia);
        return ResponseEntity.ok(resultado);
    }
}

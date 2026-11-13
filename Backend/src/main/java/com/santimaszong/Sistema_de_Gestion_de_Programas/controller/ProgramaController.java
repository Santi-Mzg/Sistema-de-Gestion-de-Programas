package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ai.formatterAPA.BibliografiaFormatterService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.pdf.PdfGeneratorService;
import lombok.extern.java.Log;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.util.List;

@Log
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProgramaController {

    private final ProgramaService programaService;
    private final com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaBorradorService borradores;
    private final PdfGeneratorService pdfService;
    private final BibliografiaFormatterService bibliografiaFormatterService;;

    public ProgramaController(ProgramaService programaService, PdfGeneratorService pdfService, BibliografiaFormatterService bibliografiaFormatterService, com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaBorradorService borradores) {
        this.programaService = programaService;
        this.borradores = borradores;
        this.pdfService = pdfService;
        this.bibliografiaFormatterService = bibliografiaFormatterService;
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

    @PatchMapping("/departamentos/{deptId}/programas/{id}/secretaria-carga")
    public ResponseEntity<ProgramaResponseDTO> secretariaCarga(@PathVariable Long deptId, @PathVariable Long id,
            @RequestBody ProgramaCargaDTO datos, @AuthenticationPrincipal UserEntity actor) {
        return ResponseEntity.ok(programaService.secretariaCarga(deptId, id, datos, actor));
    }

    // DOCENTE carga sus datos
    @PatchMapping({
            "/departamentos/{deptId}/programas/{id}/docente-carga",
            "/departamentos/{deptId}/programas/{id}/profesor-carga"
    })
    public ResponseEntity<ProgramaResponseDTO> docenteCarga(@PathVariable Long deptId,
                                                             @PathVariable Long id,
                                                             @RequestBody ProgramaCargaDTO programaDTO,
                                                             @AuthenticationPrincipal UserEntity actor) {

        return ResponseEntity.ok(programaService.docenteCarga(deptId, id, programaDTO, actor));
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
    public ResponseEntity<Page<ProgramaResponseReducedDTO>> listProgramas(
            Authentication auth,
            @PathVariable Long deptId,
            @RequestParam Rol rolActivo,
            @RequestParam(required = false) EstadoPrograma estado,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(programaService.getListAnioActual(auth, deptId, rolActivo, estado, search, pageable));
    }

    @GetMapping("/departamentos/{deptId}/programas-coordinacion")
    public ResponseEntity<Page<ProgramaResponseDTO>> listProgramasCoordinacion(
            Authentication auth,
            @PathVariable Long deptId,
            @RequestParam Rol rolActivo,
            @RequestParam(required = false) EstadoPrograma estado,
            @RequestParam(required = false) String carrera,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(programaService.getListAnioActualCoordinador(auth, deptId, rolActivo, estado, carrera, search, pageable));
    }

     @GetMapping("/departamentos/{deptId}/programas/pendientes")
     public ResponseEntity<Page<ProgramaResponseReducedDTO>> listProgramasPendientes(
             Authentication auth,
             @PathVariable Long deptId,
             @RequestParam Rol rolActivo,
             @RequestParam(defaultValue = "0") int page,
             @RequestParam(defaultValue = "10") int size
     ) {
         Pageable pageable = PageRequest.of(page, size);
         return ResponseEntity.ok(programaService.getListPendientes(auth, deptId, rolActivo, pageable));
     }

    @GetMapping("/departamentos/{deptId}/programas-coordinacion/pendientes")
    public ResponseEntity<Page<ProgramaResponseDTO>> listProgramasPendientesCoordinador(
            Authentication auth,
            @PathVariable Long deptId,
            @RequestParam Rol rolActivo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(programaService.getListPendientesCoordinador(auth, deptId, rolActivo, pageable));
    }


    @DeleteMapping("/programas/{id}")
    public ResponseEntity<Void> deletePrograma(@PathVariable Long id) {
        programaService.delete(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }




    // BORRADOR
    @PostMapping("/departamentos/{deptId}/programas/draft/{materiaId}")
    public ResponseEntity<Void> saveDraft(
            @PathVariable Long deptId, @PathVariable Long materiaId, @RequestParam Rol rolActivo,
            @RequestParam Integer anio, @RequestParam(defaultValue = "0") Long programaId,
            @RequestParam(defaultValue = "0") Long planId,
            @RequestBody ProgramaDraftDTO dto,
            @AuthenticationPrincipal UserEntity user) {
        ProgramaDraftDTO resultado = borradores.operar(user.getLegajo(), deptId, materiaId, rolActivo, anio, programaId, planId, "GUARDAR", dto);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/departamentos/{deptId}/programas/draft/{materiaId}")
    public ResponseEntity<ProgramaDraftDTO> getDraft(
            @PathVariable Long deptId, @PathVariable Long materiaId, @RequestParam Rol rolActivo,
            @RequestParam Integer anio, @RequestParam(defaultValue = "0") Long programaId,
            @RequestParam(defaultValue = "0") Long planId,

            @AuthenticationPrincipal UserEntity user) {
        ProgramaDraftDTO resultado = borradores.operar(user.getLegajo(), deptId, materiaId, rolActivo, anio, programaId, planId, "LEER", null);
        return ResponseEntity.ok(resultado);
    }

    @DeleteMapping("/departamentos/{deptId}/programas/draft/{materiaId}")
    public ResponseEntity<Void> deleteDraft(
            @PathVariable Long deptId, @PathVariable Long materiaId, @RequestParam Rol rolActivo,
            @RequestParam Integer anio, @RequestParam(defaultValue = "0") Long programaId,
            @RequestParam(defaultValue = "0") Long planId,

            @AuthenticationPrincipal UserEntity user) {
        ProgramaDraftDTO resultado = borradores.operar(user.getLegajo(), deptId, materiaId, rolActivo, anio, programaId, planId, "ELIMINAR", null);
        return ResponseEntity.noContent().build();
    }

    // DASHBOARD
    @GetMapping("/departamentos/{deptId}/dashboard/resumen")
    public ResponseEntity<DashboardResumenDTO> getDashboardResumen(
            Authentication auth,
            @PathVariable Long deptId,
            @RequestParam Rol rolActivo
    ) {
        return ResponseEntity.ok(
                programaService.getDashboardResumen(
                        auth,
                        deptId,
                        rolActivo
                )
        );
    }


    // PDF
    @GetMapping("/programas/{id}/pdf")
    public ResponseEntity<byte[]> generarPDF(@PathVariable Long id,
                                             @RequestParam(name = "planIds", required = false) List<Long> planIds) {
        byte[] pdf = pdfService.generarPdf(id, planIds);

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
        String resultado = bibliografiaFormatterService.formatearAPA(bibliografia);
        return ResponseEntity.ok(resultado);
    }
}

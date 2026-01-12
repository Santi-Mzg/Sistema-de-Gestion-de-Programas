package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.EstadoUpdateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.pdf.PdfGeneratorService;
import lombok.extern.java.Log;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProgramaController {

    private final ProgramaService programaService;
    private final PdfGeneratorService pdfService;

    public ProgramaController(ProgramaService programaService, PdfGeneratorService pdfService) {
        this.programaService = programaService;
        this.pdfService = pdfService;
    }

    @PostMapping("/programas")
    public ResponseEntity<ProgramaResponseDTO> createPrograma(@RequestBody ProgramaCargaDTO program,
                                                              @AuthenticationPrincipal UserEntity actor) {
        ProgramaResponseDTO createdProgram = programaService.create(program, actor);

        return new ResponseEntity<>(createdProgram, HttpStatus.CREATED);
    }

    @PatchMapping("/programas/{id}/administrativo-carga")
    public ResponseEntity<ProgramaResponseDTO> administrativoCarga(@PathVariable Long id,
                                                                   @RequestBody ProgramaCargaDTO program,
                                                                   @AuthenticationPrincipal UserEntity actor) {
        ProgramaResponseDTO updatedProgram = programaService.administrativoCarga(id, program, actor);

        return new ResponseEntity<>(updatedProgram, HttpStatus.OK);
    }

    // PROFESOR carga sus datos
    @PatchMapping("/programas/{id}/profesor-carga")
    public ResponseEntity<ProgramaResponseDTO> profesorCarga(@PathVariable Long id,
                                                             @RequestBody ProgramaCargaDTO programaDTO,
                                                             @AuthenticationPrincipal UserEntity actor) {

        return ResponseEntity.ok(programaService.profesorCarga(id, programaDTO, actor));
    }

    @PatchMapping("/departamentos/{deptId}/programas/{id}/estado")
    public ResponseEntity<ProgramaResponseDTO> actualizarEstado(@PathVariable Long deptId,
                                                                @PathVariable Long id,
                                                                @RequestBody EstadoUpdateDTO estadoUpdateDTO,
                                                                @RequestParam Rol rolActivo,
                                                                Authentication auth) {

        return ResponseEntity.ok(programaService.actualizarEstado(auth, deptId, id, estadoUpdateDTO, rolActivo));
    }



    @GetMapping("/programas/{id}")
    public ResponseEntity<ProgramaResponseDTO> getPrograma(@PathVariable Long id) {
        ProgramaResponseDTO foundProgram = programaService.getById(id);

        return ResponseEntity.ok(foundProgram);
    }

    @GetMapping("/materias/{materiaId}/programa-vigente")
    public ResponseEntity<ProgramaResponseDTO> getProgramaVigente(
            @PathVariable Long materiaId
    ) {
        ProgramaResponseDTO foundProgram = programaService.getProgramaVigenteByMateria(materiaId);

        return ResponseEntity.ok(foundProgram);
    }

    @GetMapping("/departamentos/{deptId}/programas")
    public List<ProgramaResponseDTO> listProgramas(
            @PathVariable Long deptId,
            @RequestParam(required = false) Long carreraId,
            @RequestParam Rol rolActivo,
            Authentication auth
    ) {
        return programaService.getList(auth, deptId, carreraId, rolActivo);
    }


    @DeleteMapping("/programas/{id}")
    public ResponseEntity<Void> deletePrograma(@PathVariable Long id) {
        programaService.delete(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("programas/{id}/pdf")
    public ResponseEntity<byte[]> descargarPrograma(@PathVariable Long id) {
        byte[] pdf = pdfService.generarPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename("programa.pdf").build());

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }


}

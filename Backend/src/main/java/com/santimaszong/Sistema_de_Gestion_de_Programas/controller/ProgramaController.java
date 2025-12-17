package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.EstadoUpdateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaAdministrativoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaProfesorDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaService;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log
@RestController
@RequestMapping("/api/programas")
@CrossOrigin(origins = "*")
public class ProgramaController {

    private final ProgramaService programaService;

    public ProgramaController(ProgramaService programaService) {
        this.programaService = programaService;
    }

    @PostMapping
//    @PreAuthorize("hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ProgramaResponseDTO> createPrograma(@RequestBody ProgramaCargaAdministrativoDTO program) {
        ProgramaResponseDTO createdProgram = programaService.createPrograma(program);

        return new ResponseEntity<>(createdProgram, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/administrativo")
//    @PreAuthorize("hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ProgramaResponseDTO> administrativoCarga(@PathVariable Long id, @RequestBody ProgramaCargaAdministrativoDTO program, @AuthenticationPrincipal UserEntity actor) {
        ProgramaResponseDTO updatedProgram = programaService.administrativoCarga(id, program, actor);

        return new ResponseEntity<>(updatedProgram, HttpStatus.OK);
    }

    // PROFESOR carga sus datos
    @PatchMapping("/{id}/profesor")
//    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<ProgramaResponseDTO> profesorCarga(@PathVariable Long id,
                                                             @RequestBody ProgramaCargaProfesorDTO programaDTO,
                                                             @AuthenticationPrincipal UserEntity actor) {

        return ResponseEntity.ok(programaService.profesorCarga(id, programaDTO, actor));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ProgramaResponseDTO> actualizarEstado(@PathVariable Long id,
                                                                @RequestBody EstadoUpdateDTO estadoUpdateDTO,
                                                                @AuthenticationPrincipal UserEntity actor) {
        ProgramaResponseDTO result = programaService.actualizarEstado(id, estadoUpdateDTO, actor);

        return ResponseEntity.ok(result);
    }



    @GetMapping("/{id}")
    public ResponseEntity<ProgramaResponseDTO> getPrograma(@PathVariable Long id) {
        ProgramaResponseDTO foundProgram = programaService.getProgramaById(id);

        return ResponseEntity.ok(foundProgram);
    }

    @GetMapping
    public List<ProgramaResponseDTO> listProgramas() {
        return programaService.listProgramas();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProgramaResponseDTO> deletePrograma(@PathVariable Long id) {
        programaService.deletePrograma(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

//    @GetMapping("/{id}/historial")
//    public List<ProgramaHistorialDTO> getHistorial(@PathVariable Long id) {
//        return programaService.findByProgramaIdOrderByFechaAsc(id)
//                .stream()
//                .map(ProgramaHistorialDTO::from)
//                .toList();
//    }

}

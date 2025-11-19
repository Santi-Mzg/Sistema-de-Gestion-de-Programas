package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Log
@RestController
@RequestMapping("/api/programas")
@CrossOrigin(origins = "*")
public class ProgramaController {

    private ProgramaService programaService;

    public ProgramaController(ProgramaService programaService) {
        this.programaService = programaService;
    }

    /*
    Administrativo

    POST /programas

    PUT /programas/{id}

    Profesor

    PUT /programas/{id}/profesor

            Coordinador

    POST /programas/{id}/coordinador/aprobar

    POST /programas/{id}/coordinador/rechazar

            Secretaría

    POST /programas/{id}/secretaria/aprobar

    POST /programas/{id}/secretaria/rechazar

    Listado y consultas generales

    GET /programas (con filtros opcionales por estado)

    GET /programas/{id}
    */



    @PostMapping
//    @PreAuthorize("hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ProgramaResponseDTO> createPrograma(@RequestBody ProgramaCreateDTO program) {
        ProgramaResponseDTO createdProgram = programaService.createPrograma(program);

        return new ResponseEntity<>(createdProgram, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
//    @PreAuthorize("hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ProgramaResponseDTO> updatePrograma(@PathVariable Long id, @RequestBody ProgramaCreateDTO program) {
        ProgramaResponseDTO updatedProgram = programaService.updatePrograma(id, program);

        return new ResponseEntity<>(updatedProgram, HttpStatus.OK);
    }

    // PROFESOR carga sus datos
    @PatchMapping("/{id}/profesor")
//    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<ProgramaResponseDTO> profesorCarga(@PathVariable Long id,
                                                             @RequestBody ProgramaCreateDTO programaDTO) {
        return ResponseEntity.ok(programaService.profesorCarga(id, programaDTO));
    }

    // PROFESOR rechaza a ADMINISTRACION
    @PostMapping("/{id}/profesor/rechazar")
//    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<Void> profesorRechazarAAdministracion(@PathVariable Long id) {
        programaService.profesorRechazarAAdministracion(id);
        return ResponseEntity.ok().build();
    }

    // COMISION aprueba
    @PostMapping("/{id}/coordinador/aprobar")
//    @PreAuthorize("hasRole('COORDINADOR')")
    public ResponseEntity<Void> comisionAprobar(@PathVariable Long id) {
        programaService.comisionAprobar(id);
        return ResponseEntity.ok().build();
    }

    // COMISION rechaza a ADMINISTRACION
    @PostMapping("/{id}/coordinador/rechazar_administracion")
//    @PreAuthorize("hasRole('COORDINADOR')")
    public ResponseEntity<Void> comisionRechazarAAdministracion(@PathVariable Long id) {
        programaService.comisionRechazarAAdministracion(id);
        return ResponseEntity.ok().build();
    }

    // COMISION rechaza a PROFESOR
    @PostMapping("/{id}/coordinador/rechazar_profesor")
//    @PreAuthorize("hasRole('COORDINADOR')")
    public ResponseEntity<Void> comisionRechazarAProfesor(@PathVariable Long id) {
        programaService.comisionRechazarAProfesor(id);
        return ResponseEntity.ok().build();
    }

    // SECRETARÍA aprueba
    @PostMapping("/{id}/secretaria/aprobar")
//    @PreAuthorize("hasRole('SECRETARIA')")
    public ResponseEntity<Void> secretariaAprobar(@PathVariable Long id) {
        programaService.secretariaAprobar(id);
        return ResponseEntity.ok().build();
    }

    // SECRETARÍA rechaza a ADMINISTRACION
    @PostMapping("/{id}/secretaria/rechazar_administracion")
//    @PreAuthorize("hasRole('SECRETARIA')")
    public ResponseEntity<Void> secretariaRechazarAAdministracion(@PathVariable Long id) {
        programaService.secretariaRechazarAAdministracion(id);
        return ResponseEntity.ok().build();
    }

    // SECRETARÍA rechaza a PROFESOR
    @PostMapping("/{id}/secretaria/rechazar_profesor")
//    @PreAuthorize("hasRole('SECRETARIA')")
    public ResponseEntity<Void> secretariaRechazarAProfesor(@PathVariable Long id) {
        programaService.secretariaRechazarAProfesor(id);
        return ResponseEntity.ok().build();
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
}

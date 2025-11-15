package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.ProgramaDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<ProgramaDTO> createPrograma(@RequestBody ProgramaDTO program) {
        ProgramaDTO createdProgram = programaService.createProgram(program);

        return new ResponseEntity<>(createdProgram, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramaDTO> getPrograma(@PathVariable Long id) {
        Optional<ProgramaDTO> foundProgram = programaService.getProgramById(id);

        return foundProgram
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<ProgramaDTO> listProgramas() {
        return programaService.listPrograms();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProgramaDTO> updatePrograma(@PathVariable Long id, @RequestBody ProgramaDTO program) {
        try{
            ProgramaDTO updatedProgram = programaService.updateProgram(id, program);

            return new ResponseEntity<>(updatedProgram, HttpStatus.OK);

        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProgramaDTO> aprobarPrograma(@PathVariable Long id, @RequestBody ProgramaDTO program) {
        try{
            ProgramaDTO updatedProgram = programaService.updateProgram(id, program);

            return new ResponseEntity<>(updatedProgram, HttpStatus.OK);

        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProgramaDTO> rechazarPrograma(@PathVariable Long id, @RequestBody ProgramaDTO program) {
        try{
            ProgramaDTO updatedProgram = programaService.updateProgram(id, program);

            return new ResponseEntity<>(updatedProgram, HttpStatus.OK);

        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProgramaDTO> deletePrograma(@PathVariable Long id) {
        programaService.deleteProgram(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

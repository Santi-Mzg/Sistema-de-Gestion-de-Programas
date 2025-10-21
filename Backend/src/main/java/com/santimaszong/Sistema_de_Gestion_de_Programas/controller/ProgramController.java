package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.ProgramDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramService;
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
public class ProgramController {

    private ProgramService programService;

    public ProgramController(ProgramService programService) {
        this.programService = programService;
    }


    @PostMapping
    public ResponseEntity<ProgramDTO> createProgram(@RequestBody ProgramDTO program) {
        ProgramDTO createdProgram = programService.createProgram(program);

        return new ResponseEntity<>(createdProgram, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramDTO> getProgram(@PathVariable Long id) {
        Optional<ProgramDTO> foundProgram = programService.getProgramById(id);

        return foundProgram
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<ProgramDTO> listPrograms() {
        return programService.listPrograms();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramDTO> updateProgram(@PathVariable Long id, @RequestBody ProgramDTO program) {
        try{
            ProgramDTO updatedProgram = programService.updateProgram(id, program);

            return new ResponseEntity<>(updatedProgram, HttpStatus.OK);

        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProgramDTO> deleteProgram(@PathVariable Long id) {
        programService.deleteProgram(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

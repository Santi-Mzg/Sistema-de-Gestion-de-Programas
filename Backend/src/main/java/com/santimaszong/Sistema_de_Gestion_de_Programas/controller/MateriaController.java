package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.MateriaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Log
@RestController
@RequestMapping("/api/materias")
@CrossOrigin(origins = "*")
public class MateriaController {

    private MateriaService materiaService;

    public MateriaController(MateriaService materiaService) {
        this.materiaService = materiaService;
    }


    @PostMapping
    public ResponseEntity<MateriaResponseDTO> createMateria(@RequestBody MateriaCreateDTO program) {
        MateriaResponseDTO createdMateria = materiaService.createMateria(program);

        return new ResponseEntity<>(createdMateria, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MateriaResponseDTO> getMateria(@PathVariable Long id) {
        MateriaResponseDTO foundMateria = materiaService.getMateriaById(id);

        return ResponseEntity.ok(foundMateria);
    }

    @GetMapping
    public List<MateriaResponseDTO> listMaterias() {
        return materiaService.listMaterias();
    }

    @PutMapping("/{id}")
    public ResponseEntity<MateriaResponseDTO> updateMateria(@PathVariable Long id, @RequestBody MateriaCreateDTO program) {
        MateriaResponseDTO updatedMateria = materiaService.updateMateria(id, program);

        return new ResponseEntity<>(updatedMateria, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MateriaResponseDTO> deleteMateria(@PathVariable Long id) {
        materiaService.deleteMateria(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

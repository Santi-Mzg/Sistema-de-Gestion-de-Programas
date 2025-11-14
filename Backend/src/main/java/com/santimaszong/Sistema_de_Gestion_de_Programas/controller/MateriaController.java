package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.MateriaDTO;
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
    public ResponseEntity<MateriaDTO> createMateria(@RequestBody MateriaDTO program) {
        MateriaDTO createdMateria = materiaService.createMateria(program);

        return new ResponseEntity<>(createdMateria, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MateriaDTO> getMateria(@PathVariable Long id) {
        Optional<MateriaDTO> foundMateria = materiaService.getMateriaById(id);

        return foundMateria
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<MateriaDTO> listMaterias() {
        return materiaService.listMaterias();
    }

    @PutMapping("/{id}")
    public ResponseEntity<MateriaDTO> updateMateria(@PathVariable Long id, @RequestBody MateriaDTO program) {
        try{
            MateriaDTO updatedMateria = materiaService.updateMateria(id, program);

            return new ResponseEntity<>(updatedMateria, HttpStatus.OK);

        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MateriaDTO> deleteMateria(@PathVariable Long id) {
        materiaService.deleteMateria(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

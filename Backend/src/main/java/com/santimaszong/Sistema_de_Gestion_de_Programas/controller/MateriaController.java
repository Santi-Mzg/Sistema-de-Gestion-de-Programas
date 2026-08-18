package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.MateriaService;
import lombok.extern.java.Log;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Log
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MateriaController {

    private final MateriaService materiaService;

    public MateriaController(MateriaService materiaService) {
        this.materiaService = materiaService;
    }


    @PostMapping("/materias")
    public ResponseEntity<MateriaResponseDTO> createMateria(@RequestBody MateriaCreateDTO materia) {
        MateriaResponseDTO createdMateria = materiaService.createMateria(materia);

        return new ResponseEntity<>(createdMateria, HttpStatus.CREATED);
    }

    @GetMapping("/materias/{id}")
    public ResponseEntity<MateriaResponseDTO> getMateria(@PathVariable Long id) {
        MateriaResponseDTO foundMateria = materiaService.getMateriaById(id);

        return ResponseEntity.ok(foundMateria);
    }

    @GetMapping("/departamentos/{deptId}/materias")
    public ResponseEntity<Page<MateriaResponseDTO>> listMateriasDepartamento(
            @PathVariable Long deptId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(materiaService.listMateriasDepartamento(deptId, search, pageable));
    }

    @GetMapping("/carreras/{carreraId}/materias")
    public List<MateriaResponseDTO> listMateriasCarreraPlan(@PathVariable Long carreraId) {
        return materiaService.listMateriasCarreraPlan(carreraId);
    }

    @PutMapping("/materias/{id}")
    public ResponseEntity<MateriaResponseDTO> updateMateria(@PathVariable Long id, @RequestBody MateriaCreateDTO program) {
        MateriaResponseDTO updatedMateria = materiaService.updateMateria(id, program);

        return new ResponseEntity<>(updatedMateria, HttpStatus.OK);
    }

    @DeleteMapping("/materias/{id}")
    public ResponseEntity<Void> deleteMateria(@PathVariable Long id) {
        materiaService.deleteMateria(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

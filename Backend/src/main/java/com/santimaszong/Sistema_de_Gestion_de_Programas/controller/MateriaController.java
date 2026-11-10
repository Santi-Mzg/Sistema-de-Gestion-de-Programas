package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.MateriaService;
import lombok.extern.java.Log;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
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

    @GetMapping("/departamentos/{deptId}/materias/sin-programa")
    public ResponseEntity<Page<MateriaResponseDTO>> listMateriasSinPrograma(
            @PathVariable Long deptId,
            @RequestHeader("X-Departamento-Activo") Long departamentoActivo,
            @RequestHeader("X-Rol-Activo") Rol rol,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        if (!deptId.equals(departamentoActivo)) {
            throw new AccessDeniedException("La consulta no corresponde al departamento activo");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("nombre").ascending().and(Sort.by("id")));
        return ResponseEntity.ok(materiaService.listMateriasSinPrograma(deptId, auth.getName(), rol, search, pageable));
    }

    @PutMapping("/materias/{id}")
    public ResponseEntity<MateriaResponseDTO> updateMateria(@PathVariable Long id, @RequestBody MateriaCreateDTO datos,
            @RequestHeader("X-Departamento-Activo") Long deptId,
            @RequestHeader("X-Rol-Activo") Rol rol,
            Authentication auth) {
        return ResponseEntity.ok(materiaService.updateMateria(id, datos, auth.getName(), deptId, rol));
    }

    @DeleteMapping("/materias/{id}")
    public ResponseEntity<Void> deleteMateria(@PathVariable Long id) {
        materiaService.deleteMateria(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.DepartamentoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.DepartamentoService;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Log
@RestController
@RequestMapping("/api/departamentos")
@CrossOrigin(origins = "*")
public class DepartamentoController {

    private DepartamentoService departamentoService;

    public DepartamentoController(DepartamentoService departamentoService) {
        this.departamentoService = departamentoService;
    }


    @PostMapping
    public ResponseEntity<DepartamentoDTO> createDepartamento(@RequestBody DepartamentoDTO departamento) {
        DepartamentoDTO createdDepartamento = departamentoService.createDepartamento(departamento);

        return new ResponseEntity<>(createdDepartamento, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartamentoDTO> getDepartamento(@PathVariable Long id) {
        Optional<DepartamentoDTO> foundDepartamento = departamentoService.getDepartamentoById(id);

        return foundDepartamento
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<DepartamentoDTO> listDepartamentos() {
        return departamentoService.listDepartamentos();
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartamentoDTO> updateDepartamento(@PathVariable Long id, @RequestBody DepartamentoDTO departamento) {
            return departamentoService.updateDepartamento(id, departamento)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DepartamentoDTO> deleteDepartamento(@PathVariable Long id) {
        departamentoService.deleteDepartamento(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

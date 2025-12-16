package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.departamento.DepartamentoUpdateCargoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.DepartamentoService;
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

    private final DepartamentoService departamentoService;

    public DepartamentoController(DepartamentoService departamentoService) {
        this.departamentoService = departamentoService;
    }


    @PostMapping
    public ResponseEntity<DepartamentoResponseDTO> createDepartamento(@RequestBody DepartamentoCreateDTO departamento) {
        DepartamentoResponseDTO createdDepartamento = departamentoService.createDepartamento(departamento);

        return new ResponseEntity<>(createdDepartamento, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartamentoResponseDTO> getDepartamento(@PathVariable Long id) {
        DepartamentoResponseDTO foundDepartamento = departamentoService.getDepartamentoById(id);

        return ResponseEntity.ok(foundDepartamento);
    }

    @GetMapping
    public List<DepartamentoResponseDTO> listDepartamentos() {
        return departamentoService.listDepartamentos();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DepartamentoResponseDTO> updateDepartamento(@PathVariable Long id, @RequestBody DepartamentoCreateDTO departamento) {
        DepartamentoResponseDTO updatedDepartamento = departamentoService.updateDepartamento(id, departamento);

        return new ResponseEntity<>(updatedDepartamento, HttpStatus.OK);
    }

    @GetMapping("/{id}/materias")
    public List<MateriaResponseDTO> listMateriasDepartamento(@PathVariable Long id) {
        return departamentoService.listMateriasByDepartamento(id);
    }

//    @GetMapping("/{id}/profesores")
//    public List<UserResponseDTO> listProfesoresDepartamento(@PathVariable Long id) {
//        return departamentoService.listProfesoresByDepartamento(id);
//    }

    @PatchMapping("/cambiar_secretaria/{id}")
    public ResponseEntity<DepartamentoResponseDTO> updateSecretaria(@PathVariable Long id, @RequestBody DepartamentoUpdateCargoDTO departamento) {
        departamentoService.updateSecretaria(id, departamento);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);

    }

    @PatchMapping("/cambiar_direccion_administrativa/{id}")
    public ResponseEntity<DepartamentoResponseDTO> updateDireccionAdministrativa(@PathVariable Long id, @RequestBody DepartamentoUpdateCargoDTO departamento) {
        departamentoService.updateDireccionAdministrativa(id, departamento);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PatchMapping("/cambiar_administracion/{id}")
    public ResponseEntity<DepartamentoResponseDTO> updateAdministracionDepartamento(@PathVariable Long id, @RequestBody DepartamentoCreateDTO departamento) {
        DepartamentoResponseDTO updatedDepartamento = departamentoService.updateAdministracionDepartamento(id, departamento);

        return new ResponseEntity<>(updatedDepartamento, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DepartamentoResponseDTO> deleteDepartamento(@PathVariable Long id) {
        departamentoService.deleteDepartamento(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

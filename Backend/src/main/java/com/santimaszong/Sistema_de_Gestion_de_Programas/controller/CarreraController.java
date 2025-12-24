package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraUpdateComisionDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.CarreraService;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Log
@RestController
@RequestMapping("/api/carreras")
@CrossOrigin(origins = "*")
public class CarreraController {

    private final CarreraService carreraService;

    public CarreraController(CarreraService carreraService) {
        this.carreraService = carreraService;
    }


    @PostMapping
    public ResponseEntity<CarreraResponseDTO> createCarrera(@RequestBody CarreraCreateDTO carrera) {
        CarreraResponseDTO createdCarrera = carreraService.createCarrera(carrera);

        return new ResponseEntity<>(createdCarrera, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarreraResponseDTO> getCarrera(@PathVariable Long id) {
        CarreraResponseDTO foundCarrera = carreraService.getCarreraById(id);

        return ResponseEntity.ok(foundCarrera);
    }

    @GetMapping
    public List<CarreraResponseDTO> listCarreras() {
        return carreraService.listCarreras();
    }

    @GetMapping("/{id}/materias")
    public List<MateriaResponseDTO> listMateriasCarrera(@PathVariable Long id) {
        return carreraService.listMateriasByCarrera(id);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CarreraResponseDTO> updateCarrera(@PathVariable Long id, @RequestBody CarreraCreateDTO carrera) {
        CarreraResponseDTO updatedCarrera = carreraService.updateCarrera(id, carrera);

        return new ResponseEntity<>(updatedCarrera, HttpStatus.OK);
    }

    @PatchMapping("/cambiar_comision/{id}")
    public ResponseEntity<CarreraResponseDTO> updateComision(@PathVariable Long id, @RequestBody CarreraUpdateComisionDTO carrera) {
        carreraService.updateComision(id, carrera);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCarrera(@PathVariable Long id) {
        carreraService.deleteCarrera(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

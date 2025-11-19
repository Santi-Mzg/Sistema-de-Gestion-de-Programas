package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.carrera.CarreraResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.CarreraService;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Log
@RestController
@RequestMapping("/api/carreras")
@CrossOrigin(origins = "*")
public class CarreraController {

    private CarreraService carreraService;

    public CarreraController(CarreraService carreraService) {
        this.carreraService = carreraService;
    }


    @PostMapping
    public ResponseEntity<CarreraResponseDTO> createCarrera(@RequestBody CarreraCreateDTO program) {
        CarreraResponseDTO createdCarrera = carreraService.createCarrera(program);

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

    @PatchMapping("/{id}")
    public ResponseEntity<CarreraResponseDTO> updateCarrera(@PathVariable Long id, @RequestBody CarreraCreateDTO program) {
        CarreraResponseDTO updatedCarrera = carreraService.updateCarrera(id, program);

        return new ResponseEntity<>(updatedCarrera, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CarreraResponseDTO> deleteCarrera(@PathVariable Long id) {
        carreraService.deleteCarrera(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

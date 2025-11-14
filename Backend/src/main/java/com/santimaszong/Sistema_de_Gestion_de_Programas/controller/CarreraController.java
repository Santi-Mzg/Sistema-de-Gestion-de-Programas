package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.CarreraDTO;
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
    public ResponseEntity<CarreraDTO> createCarrera(@RequestBody CarreraDTO program) {
        CarreraDTO createdCarrera = carreraService.createCarrera(program);

        return new ResponseEntity<>(createdCarrera, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarreraDTO> getCarrera(@PathVariable Long id) {
        Optional<CarreraDTO> foundCarrera = carreraService.getCarreraById(id);

        return foundCarrera
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<CarreraDTO> listCarreras() {
        return carreraService.listCarreras();
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarreraDTO> updateCarrera(@PathVariable Long id, @RequestBody CarreraDTO program) {
        try{
            CarreraDTO updatedCarrera = carreraService.updateCarrera(id, program);

            return new ResponseEntity<>(updatedCarrera, HttpStatus.OK);

        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CarreraDTO> deleteCarrera(@PathVariable Long id) {
        carreraService.deleteCarrera(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.AreaService;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log
@RestController
@RequestMapping("/api/areas")
@CrossOrigin(origins = "*")
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }


    @PostMapping
    public ResponseEntity<AreaResponseDTO> createArea(@RequestBody AreaCreateDTO program) {
        AreaResponseDTO createdArea = areaService.createArea(program);

        return new ResponseEntity<>(createdArea, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AreaResponseDTO> getArea(@PathVariable Long id) {
        AreaResponseDTO foundArea = areaService.getAreaById(id);

        return ResponseEntity.ok(foundArea);
    }

    @GetMapping
    public List<AreaResponseDTO> listAreas() {
        return areaService.listAreas();
    }

    @PutMapping("/{id}")
    public ResponseEntity<AreaResponseDTO> updateArea(@PathVariable Long id, @RequestBody AreaCreateDTO program) {
        AreaResponseDTO updatedArea = areaService.updateArea(id, program);

        return new ResponseEntity<>(updatedArea, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AreaResponseDTO> deleteArea(@PathVariable Long id) {
        areaService.deleteArea(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

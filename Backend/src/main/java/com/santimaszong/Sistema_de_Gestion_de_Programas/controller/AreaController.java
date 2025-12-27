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
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @PostMapping("/departamentos/{deptId}/areas")
    public ResponseEntity<AreaResponseDTO> createArea(@PathVariable Long deptId, @RequestBody AreaCreateDTO area) {
        AreaResponseDTO createArea = areaService.createArea(deptId, area);

        return new ResponseEntity<>(createArea, HttpStatus.CREATED);
    }

    @GetMapping("/areas/{id}")
    public ResponseEntity<AreaResponseDTO> getArea(@PathVariable Long id) {
        AreaResponseDTO foundArea = areaService.getAreaById(id);

        return ResponseEntity.ok(foundArea);
    }

    @GetMapping("/departamentos/{deptId}/areas")
    public List<AreaResponseDTO> listAreasDepartamento(@PathVariable Long deptId) {
        return areaService.listAreasDepartamento(deptId);
    }

    @PutMapping("/areas/{id}")
    public ResponseEntity<AreaResponseDTO> updateArea(@PathVariable Long id, @RequestBody AreaCreateDTO program) {
        AreaResponseDTO updatedArea = areaService.updateArea(id, program);

        return new ResponseEntity<>(updatedArea, HttpStatus.OK);
    }

    @DeleteMapping("/areas/{id}")
    public ResponseEntity<Void> deleteArea(@PathVariable Long id) {
        areaService.deleteArea(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

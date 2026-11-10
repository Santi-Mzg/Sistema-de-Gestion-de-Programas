package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.AreaService;
import lombok.extern.java.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    public record AsignacionCoordinador(Long usuarioId) {}

    @PatchMapping("/departamentos/{deptId}/areas/{id}/coordinador")
    public ResponseEntity<AreaResponseDTO> asignarCoordinador(@PathVariable Long deptId, @PathVariable Long id,
            @RequestParam com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol rolActivo,
            @RequestBody AsignacionCoordinador datos, org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(areaService.updateCoordinador(auth.getName(), deptId, rolActivo, id, datos.usuarioId()));
    }

    @GetMapping("/departamentos/{deptId}/areas/candidatos-coordinacion")
    public List<com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseReducedDTO> candidatos(
            @PathVariable Long deptId, @RequestParam com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol rolActivo,
            org.springframework.security.core.Authentication auth) {
        return areaService.candidatosCoordinacion(auth.getName(), deptId, rolActivo);
    }

    @GetMapping("/departamentos/{deptId}/mis-areas")
    public List<AreaResponseDTO> misAreas(@PathVariable Long deptId, org.springframework.security.core.Authentication auth) {
        return areaService.misAreas(auth.getName(), deptId);
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
    public ResponseEntity<Page<AreaResponseDTO>> listAreasDepartamento(
        @PathVariable Long deptId,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(areaService.listAreasDepartamento(deptId, search, pageable));
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

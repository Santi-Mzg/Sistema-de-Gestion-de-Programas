package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UserService;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Log
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/departamentos/{deptId}/usuarios")
    public ResponseEntity<UserResponseDTO> createUser(@PathVariable Long deptId, @RequestBody UserCreateDTO user) {
        UserResponseDTO createdUser = userService.createUser(deptId, user);

        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        UserResponseDTO foundUser = userService.getUserById(id);

        return ResponseEntity.ok(foundUser);
    }
    @GetMapping("/usuarios/legajo/{legajo}")
    public ResponseEntity<UserResponseDTO> getUserByLegajo(@PathVariable String legajo) {
        UserResponseDTO foundUser = userService.getUserByLegajo(legajo);

        return ResponseEntity.ok(foundUser);
    }

    @GetMapping("/departamentos/{deptId}/usuarios")
    public List<UserResponseDTO> listUsersDepartamento(@PathVariable Long deptId, @AuthenticationPrincipal UserEntity auth) {
        return userService.listUsersDepartamento(deptId, auth);
    }

    @GetMapping("/departamentos/{deptId}/usuarios/docentes")
    public List<UserResponseDTO> listDocentesDepartamento(@PathVariable Long deptId, @AuthenticationPrincipal UserEntity auth) {
        return userService.listDocentesDepartamento(deptId, auth);
    }

    @GetMapping("/departamentos/{deptId}/usuarios/secretarios")
    public List<UserResponseDTO> listCoordinadoresDepartamento(@PathVariable Long deptId, @AuthenticationPrincipal UserEntity auth) {
        return userService.listCoordinadoresDepartamento(deptId, auth);
    }

    @GetMapping("/departamentos/{deptId}/usuarios/coordinadores")
    public List<UserResponseDTO> listSecretariosDepartamento(@PathVariable Long deptId, @AuthenticationPrincipal UserEntity auth) {
        return userService.listSecretariosDepartamento(deptId, auth);
    }

    @GetMapping("/departamentos/{deptId}/usuarios/administrativos")
    public List<UserResponseDTO> listAdministrativosDepartamento(@PathVariable Long deptId, @AuthenticationPrincipal UserEntity auth) {
        return userService.listAdministrativosDepartamento(deptId, auth);
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @RequestBody UserCreateDTO user) {
        UserResponseDTO updatedUser = userService.updateUser(id, user);

        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

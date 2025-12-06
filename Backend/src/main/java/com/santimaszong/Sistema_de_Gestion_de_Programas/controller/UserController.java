package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Log
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody UserCreateDTO user) {
        UserResponseDTO createdUser = userService.createUser(user);

        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable Long id) {
        UserResponseDTO foundUser = userService.getUserById(id);

        return ResponseEntity.ok(foundUser);
    }

    @GetMapping
    public List<UserResponseDTO> listUsers() {
        return userService.listUsers();
    }

    @GetMapping("/profesores")
    public List<UserResponseDTO> listProfesores() {
        return userService.listProfesores();
    }

    @GetMapping("/administrativos")
    public List<UserResponseDTO> listAdministrativos() {
        return userService.listAdministrativos();
    }

    @GetMapping("/secretarios")
    public List<UserResponseDTO> listSecretarios() {
        return userService.listSecretarios();
    }

    @GetMapping("/coordinadores")
    public List<UserResponseDTO> listCoordinadores() {
        return userService.listCoordinadores();
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @RequestBody UserCreateDTO user) {
        UserResponseDTO updatedUser = userService.updateUser(id, user);

        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<UserResponseDTO> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

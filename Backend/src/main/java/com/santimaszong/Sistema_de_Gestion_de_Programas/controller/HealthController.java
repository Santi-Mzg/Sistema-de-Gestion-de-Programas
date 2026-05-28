package com.santimaszong.Sistema_de_Gestion_de_Programas.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping("/api/ping")
    public String ping() {
        return "ok";
    }
}
package com.santimaszong.Sistema_de_Gestion_de_Programas;

import lombok.extern.java.Log;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@Log
@EnableAsync
public class SistemaDeGestionDeProgramasApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaDeGestionDeProgramasApplication.class, args);
	}

}

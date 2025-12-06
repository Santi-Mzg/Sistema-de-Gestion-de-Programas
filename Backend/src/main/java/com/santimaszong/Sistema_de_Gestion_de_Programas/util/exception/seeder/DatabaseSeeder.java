package com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.seeder;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final DepartamentoRepository departamentoRepository;
    private final CarreraRepository carreraRepository;
    private final MateriaRepository materiaRepository;
    private final ProgramaRepository programaRepository;
    private final UserRepository userRepository;


    public DatabaseSeeder(DepartamentoRepository departamentoRepository,
                          CarreraRepository carreraRepository,
                          MateriaRepository materiaRepository,
                          ProgramaRepository programaRepository,
                          UserRepository userRepository) {

        this.departamentoRepository = departamentoRepository;
        this.carreraRepository = carreraRepository;
        this.materiaRepository = materiaRepository;
        this.programaRepository = programaRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {

    }


    private void seedRoles() {
        System.out.println("Iniciando seedeo de Roles...");


        System.out.println("Seedeo de Roles completado.");
    }

//    private void seedDepartamentos() {
//
//    }
//
//    private void seedCarreras() {
//
//    }
//
//    private void seedMaterias() {
//
//    }
//
//    private void seedProgramas() {
//
//    }
//
//    private void seedUsers() {
//
//    }
}
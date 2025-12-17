package com.santimaszong.Sistema_de_Gestion_de_Programas.util.seeder;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;


import org.springframework.security.crypto.password.PasswordEncoder;


@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final DepartamentoRepository departamentoRepository;
    private final CarreraRepository carreraRepository;
    private final MateriaRepository materiaRepository;
    private final ProgramaRepository programaRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;



    public DatabaseSeeder(DepartamentoRepository departamentoRepository,
                          CarreraRepository carreraRepository,
                          MateriaRepository materiaRepository,
                          ProgramaRepository programaRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {

        this.departamentoRepository = departamentoRepository;
        this.carreraRepository = carreraRepository;
        this.materiaRepository = materiaRepository;
        this.programaRepository = programaRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if(userRepository.findAll().isEmpty()){
            seedAdminUser();
        }
    }


    private void seedRoles() {
        System.out.println("Iniciando seedeo de Roles...");


        System.out.println("Seedeo de Roles completado.");
    }


    private void seedAdminUser() {
        UserEntity admin = new UserEntity();
        admin.setNombre("admin");
        admin.setApellido("");
        admin.setLegajo("");
        admin.setPassword(passwordEncoder.encode("admin"));
        userRepository.save(admin);
    }


}
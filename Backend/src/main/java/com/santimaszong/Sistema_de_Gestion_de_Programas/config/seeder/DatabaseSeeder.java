package com.santimaszong.Sistema_de_Gestion_de_Programas.config.seeder;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.RolType;
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
    private final RolRepository rolRepository;


    public DatabaseSeeder(DepartamentoRepository departamentoRepository,
                          CarreraRepository carreraRepository,
                          MateriaRepository materiaRepository,
                          ProgramaRepository programaRepository,
                          UserRepository userRepository,
                          RolRepository rolRepository) {

        this.departamentoRepository = departamentoRepository;
        this.carreraRepository = carreraRepository;
        this.materiaRepository = materiaRepository;
        this.programaRepository = programaRepository;
        this.userRepository = userRepository;
        this.rolRepository = rolRepository;
    }

    @Override
    public void run(String... args) {

        if (rolRepository.count() == 0) {
            seedRoles();
        }

    }


    private void seedRoles() {
        System.out.println("Iniciando seedeo de Roles...");

        // Obtenemos todos los valores del Enum RolType
        List<RolType> rolTypes = Arrays.asList(RolType.values());

        for (RolType type : rolTypes) {
            if (rolRepository.findByName(type).isEmpty()) {

                Rol rol = new Rol();
                rol.setName(type);

                rolRepository.save(rol);
                System.out.println("✅ Rol creado: " + type.name());
            }
        }

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
package com.santimaszong.Sistema_de_Gestion_de_Programas.util.seeder;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;


import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;


@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final DepartamentoRepository departamentoRepository;
    private final CarreraRepository carreraRepository;
    private final MateriaRepository materiaRepository;
    private final ProgramaRepository programaRepository;
    private final UserRepository userRepository;
    private final UsuarioDepartamentoRepository udeRepository;
    private final PasswordEncoder passwordEncoder;



    public DatabaseSeeder(DepartamentoRepository departamentoRepository,
                          CarreraRepository carreraRepository,
                          MateriaRepository materiaRepository,
                          ProgramaRepository programaRepository,
                          UserRepository userRepository,
                          UsuarioDepartamentoRepository udeRepository,
                          PasswordEncoder passwordEncoder) {

        this.departamentoRepository = departamentoRepository;
        this.carreraRepository = carreraRepository;
        this.materiaRepository = materiaRepository;
        this.programaRepository = programaRepository;
        this.userRepository = userRepository;
        this.udeRepository = udeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if(departamentoRepository.findAll().isEmpty()){
            seedDepartamentosCarrerasMaterias();
        }
        if(userRepository.findAll().isEmpty()){
            seedAdminUser();
        }
    }


    private void seedAdminUser() {
        UserEntity admin = new UserEntity();
        admin.setNombre("admin");
        admin.setApellido("");
        admin.setLegajo("00000");
        admin.setPassword(passwordEncoder.encode("admin"));
        admin.setAdmin(true);

        List<DepartamentoEntity> depts = departamentoRepository.findAll();
        depts.forEach(dept -> {
            crearUDE(admin, dept);
        });



        userRepository.save(admin);
    }

    private void seedDepartamentosCarrerasMaterias() {

        ////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////     D E P A R T A M E N T O S      //////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////

        DepartamentoEntity agronomia = crearDepartamento(
                "Agronomía",
                "San Andrés 800. Altos de Palihue",
                "+54 (0291) 4595102",
                "agronomia@uns.edu.ar"
        );

        DepartamentoEntity biologia = crearDepartamento(
                "Biología, Bioquímica y Farmacia",
                "San Juan 670. Primer Piso",
                "+54 (0291) 4595129",
                "dtbbf@uns.edu.ar"
        );

        DepartamentoEntity cienciasAdministracion = crearDepartamento(
                "Ciencias de la Administración",
                "San Andrés 800. Altos de Palihue",
                "+54 (0291) 4595132",
                "dca@uns.edu.ar"
        );

        DepartamentoEntity cienciasEducacion = crearDepartamento(
                "Ciencias de la Educación",
                "Avenida Alem 235",
                "+54 (0291) 4595101",
                "educacion@uns.edu.ar"
        );

        DepartamentoEntity cienciasSalud = crearDepartamento(
                "Ciencias de la Salud",
                "Florida 1450. Hospital Militar Bahía Blanca",
                "+54 (0291) 4595212",
                "dcs@uns.edu.ar"
        );

        DepartamentoEntity cienciasComputacion = crearDepartamento(
                "Ciencias e Ingeniería de Computación",
                "San Andrés 800. Altos de Palihue",
                "+54 (0291) 4595135",
                "dcic@cs.uns.edu.ar"
        );

        DepartamentoEntity derecho = crearDepartamento(
                "Derecho",
                "Avenida Colón 50",
                "+54 (0291) 4595084",
                "derecho@uns.edu.ar"
        );

        DepartamentoEntity economia = crearDepartamento(
                "Economía",
                "San Andrés 800. Altos de Palihue",
                "+54 (0291) 4595138",
                "departamento.economia@uns.edu.ar"
        );

        DepartamentoEntity fisica = crearDepartamento(
                "Física",
                "Avenida Alem 1253",
                "+54 (0291) 4595141",
                "dfisica@uns.edu.ar"
        );

        DepartamentoEntity geografiaTurismo = crearDepartamento(
                "Geografía y Turismo",
                "12 de Octubre y San Juan. 4° Piso",
                "+54 (0291) 4595144",
                "geografia@uns.edu.ar"
        );

        DepartamentoEntity geologia = crearDepartamento(
                "Geología",
                "Av. Alem 1253, cuerpo B. 2° Piso",
                "+54 (0291) 4595147",
                "administracion.geologia@uns.edu.ar"
        );

        DepartamentoEntity humanidades = crearDepartamento(
                "Humanidades",
                "12 de Octubre y San Juan. 5° Piso",
                "+54 (0291) 4595150",
                "humanidades@uns.edu.ar"
        );

        DepartamentoEntity ingenieria = crearDepartamento(
                "Ingeniería",
                "Avenida Alem 1253. Primer Piso",
                "+54 (0291) 4595156",
                "ingenieria@uns.edu.ar"
        );

        DepartamentoEntity ingenieriaElectrica = crearDepartamento(
                "Ingeniería Eléctrica y de Computadoras",
                "Avenida Alem 1253. Primer Piso",
                "+54 (0291) 4595153",
                "ingelect@uns.edu.ar"
        );

        DepartamentoEntity ingenieriaQuimica = crearDepartamento(
                "Ingeniería Química",
                "Avenida Alem 1253. Primer Piso - Ala C",
                "+54 (0291) 4595170",
                "diq@uns.edu.ar"
        );

        DepartamentoEntity matematica = crearDepartamento(
                "Matemática",
                "Avenida Alem 1253. 2° Piso",
                "+54 (0291) 4595162",
                "dmat@uns.edu.ar"
        );

        DepartamentoEntity quimica = crearDepartamento(
                "Química",
                "Avenida Alem 1253. Planta Baja",
                "+54 (0291) 4595159",
                "quimica@uns.edu.ar"
        );

        ////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////     C A R R E R A S      ///////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////

        crearCarrera("Ingeniería Agronómica", "10 Cuat.", "Plan 2026 - Versión 1", agronomia);
        crearCarrera("Tecnicatura Superior Agraria en Suelos y Aguas", "5 Cuat.", "Plan 2026 - Versión 1", agronomia);
        crearCarrera("Tecnicatura Universitaria Apícola", "6 Cuat.", "Plan 2008 - Versión 1", agronomia);
        crearCarrera("Tecnicatura Universitaria en Parques y Jardines", "6 Cuat.", "Plan 2018 - Versión 2", agronomia);

        crearCarrera("Bioquímica", "11 Cuat.", "Plan 2025 - Versión 1", biologia);
        crearCarrera("Farmacia", "10 Cuat.", "Plan 2025 - Versión 1", biologia);
        crearCarrera("Licenciatura en Ciencias Biológicas", "10 Cuat.", "Plan 2014 - Versión 2", biologia);
        crearCarrera("Profesorado en Ciencias Biológicas", "8 Cuat.", "Plan 2020 - Versión 1", biologia);

        crearCarrera("Contador Público", "10 Cuat.", "Plan 2016 - Versión 3", cienciasAdministracion);
        crearCarrera("Licenciatura en Administración", "10 Cuat.", "Plan 2016 - Versión 2", cienciasAdministracion);
        crearCarrera("Licenciatura en Gestión Universitaria", "10 Cuat.", "Plan 2018 - Versión 1", cienciasAdministracion);
        crearCarrera("Profesorado en Educación Secundaria en Ciencias de la Administración", "8 Cuat.", "Plan 2022 - Versión 1", cienciasAdministracion);
        crearCarrera("Profesorado en Educación Secundaria y Superior en Ciencias de la Administración", "10 Cuat.", "Plan 2022 - Versión 1", cienciasAdministracion);
        crearCarrera("Tecnicatura Superior en Administración y Gestión de Recursos para Instituciones Universitarias", "6 Cuat.", "Plan 2011 - Versión 1", cienciasAdministracion);

        crearCarrera("Licenciatura en Ciencias de la Educación", "10 Cuat.", "Plan 2014 - Versión 1", cienciasEducacion);
        crearCarrera("Profesorado de Educación Inicial", "8 Cuat.", "Plan 2009 - Versión 1", cienciasEducacion);
        crearCarrera("Profesorado de Educación Primaria", "8 Cuat.", "Plan 2009 - Versión 1", cienciasEducacion);

        crearCarrera("Licenciatura en Enfermería", "10 Cuat.", "Plan 2024 - Versión 1", cienciasSalud);
        crearCarrera("Licenciatura en Obstetricia", "-", "Plan 2024 - Versión 1", cienciasSalud);
        crearCarrera("Medicina", "12 Cuat.", "Plan 2023 - Versión 1", cienciasSalud);
        crearCarrera("Tecnicatura Universitaria en Acompañamiento Terapéutico", "6 Cuat.", "Plan 2021 - Versión 1", cienciasSalud);

        crearCarrera("Ingeniería en Computación", "10 Cuat.", "Plan 2013 - Versión 1", cienciasComputacion);
        crearCarrera("Ingeniería en Sistemas de Información", "10 Cuat.", "Plan 2012 - Versión 1", cienciasComputacion);
        crearCarrera("Licenciatura en Ciencias de la Computación", "10 Cuat.", "Plan 2012 - Versión 1", cienciasComputacion);
        crearCarrera("Tecnicatura Universitaria en Programación Web y Móvil", "5 Cuat.", "Plan 2023 - Versión 1", cienciasComputacion);

        crearCarrera("Abogacía", "10 Cuat.", "Plan 2020 - Versión 2", derecho);
        crearCarrera("Licenciatura en Seguridad Pública", "4 Cuat.", "Plan 2018 - Versión 1", derecho);
        crearCarrera("Licenciatura en Seguridad Pública - A Distancia", "4 Cuat.", "Plan 2024 - Versión 1", derecho);

        crearCarrera("Licenciatura en Economía", "9 Cuat.", "Plan 2025 - Versión 1", economia);
        crearCarrera("Profesorado en Economía", "10 Cuat.", "Plan 2020 - Versión 1", economia);
        crearCarrera("Profesorado en Economía para la Enseñanza Secundaria", "8 Cuat.", "Plan 2020 - Versión 1", economia);
        crearCarrera("Tecnicatura Universitaria en Deporte", "6 Cuat.", "Plan 2023 - Versión 1", economia);
        crearCarrera("Tecnicatura Universitaria en Economía y Gestión de Empresas Alimentarias", "6 Cuat.", "Plan 2020 - Versión 1", economia);

        crearCarrera("Licenciatura en Física", "10 Cuat.", "Plan 2024 - Versión 2", fisica);
        crearCarrera("Licenciatura en Geofísica", "10 Cuat.", "Plan 2024 - Versión 2", fisica);
        crearCarrera("Licenciatura en Óptica y Contactología", "8 Cuat.", "Plan 2019 - Versión 1", fisica);
        crearCarrera("Profesorado en Física", "8 Cuat.", "Plan 2024 - Versión 2", fisica);
        crearCarrera("Tecnicatura Universitaria en Óptica", "6 Cuat.", "Plan 2018 - Versión 1", fisica);

        crearCarrera("Arquitectura", "10 Cuat.", "Plan 2016 - Versión 2",geografiaTurismo);
        crearCarrera("Licenciatura en Geografía", "10 Cuat.", "Plan 2025 - Versión 1", geografiaTurismo);
        crearCarrera("Licenciatura en Oceanografía", "10 Cuat.", "Plan 2019 - Versión 1", geografiaTurismo);
        crearCarrera("Licenciatura en Turismo", "9 Cuat.", "Plan 2025 - Versión 1", geografiaTurismo);
        crearCarrera("Profesorado en Geografía", "9 Cuat.", "Plan 2010 - Versión 1", geografiaTurismo);
        crearCarrera("Profesorado Universitario en Geografía", "10 Cuat.", "Plan 2025 - Versión 1",geografiaTurismo);
        crearCarrera("Tecnicatura Universitaria en Cartografía, Teledetección y Sistemas de Información Geográfica", "6 Cuat.", "Plan 2011 - Versión 2",geografiaTurismo);
        crearCarrera("Tecnicatura Universitaria en Oceanografía", "6 Cuat.", "Plan 2024 - Versión 1",geografiaTurismo);

        crearCarrera("Licenciatura en Ciencias Geológicas", "10 Cuat.","Plan 2023 - Versión 1", geologia);
        crearCarrera("Profesorado en Geociencias", "8 Cuat.", "Plan 2020 - Versión 1",geologia);
        crearCarrera("Tecnicatura Universitaria en Medio Ambiente", "6 Cuat.","Plan 2015 - Versión 1", geologia);

        crearCarrera("Licenciatura en Filosofía", "10 Cuat.","Plan 2006 - Versión 2", humanidades);
        crearCarrera("Licenciatura en Historia", "10 Cuat.","Plan 2002 - Versión 2", humanidades);
        crearCarrera("Licenciatura en Letras", "10 Cuat.","Plan 2006 - Versión 2", humanidades);
        crearCarrera("Profesorado en Filosofía", "10 Cuat.","Plan 2006 - Versión 3", humanidades);
        crearCarrera("Profesorado en Historia", "10 Cuat.","Plan 2002 - Versión 3", humanidades);
        crearCarrera("Profesorado en Letras", "10 Cuat.","Plan 2006 - Versión 3", humanidades);

        crearCarrera("Agrimensura", "10 Cuat.","Plan 2011 - Versión 1", ingenieria);
        crearCarrera("Ingeniería Civil", "10 Cuat.", "Plan 2025 - Versión 1", ingenieria);
        crearCarrera("Ingeniería Industrial", "10 Cuat.", "Plan 2026 - Versión 1", ingenieria);
        crearCarrera("Ingeniería Mecánica", "10 Cuat.", "Plan 2025 - Versión 1", ingenieria);

        crearCarrera("Ingeniería Electricista", "10 Cuat.", "Plan 2025 - Versión 1", ingenieriaElectrica);
        crearCarrera("Ingeniería Electrónica", "10 Cuat.", "Plan 2025 - Versión 1", ingenieriaElectrica);
        crearCarrera("Ingeniería en Telecomunicaciones", "10 Cuat.", "Plan 2023 - Versión 1", ingenieriaElectrica);
        crearCarrera("Tecnicatura Universitaria en Sistemas Electrónicos Industriales Inteligentes", "6 Cuat.", "Plan 2024 - Versión 1", ingenieriaElectrica);

        crearCarrera("Ingeniería en Alimentos", "10 Cuat.", "Plan 2025 - Versión 1", ingenieriaQuimica);
        crearCarrera("Ingeniería Química", "10 Cuat.", "Plan 2024 - Versión 1", ingenieriaQuimica);
        crearCarrera("Tecnicatura Universitaria en Operaciones Industriales", "6 Cuat.", "Plan 2026 - Versión 1", ingenieriaQuimica);
        crearCarrera("Tecnicatura Universitaria en Petróleo y Gas", "6 Cuat.", "Plan 2025 - Versión 1", ingenieriaQuimica);

        crearCarrera("Licenciatura en Matemática", "10 Cuat.", "Plan 2023 - Versión 1", matematica);
        crearCarrera("Licenciatura en Matemática Aplicada", "10 Cuat.", "Plan 2023 - Versión 1", matematica);
        crearCarrera("Profesorado en Matemática", "8 Cuat.", "Plan 2023 - Versión 1", matematica);

        crearCarrera("Licenciatura en Ciencias Ambientales", "10 Cuat.", "Plan 2015 - Versión 1", quimica);
        crearCarrera("Licenciatura en Química", "10 Cuat.", "Plan 2023 - Versión 1", quimica);
        crearCarrera("Profesorado en Química", "10 Cuat.", "Plan 2005 - Versión 3", quimica);
        crearCarrera("Profesorado en Química de la Enseñanza Media", "8 Cuat.", "Plan 2009 - Versión 2", quimica);
    }



    private void crearCarrera(
            String nombre,
            String duracion,
            String plan,
            DepartamentoEntity departamento
    ) {
        CarreraEntity carrera = new CarreraEntity();
        carrera.setNombre(nombre);
        carrera.setDuracion(duracion);
        carrera.setPlan(plan);
        carrera.setDepartamento(departamento);
        carreraRepository.save(carrera);
    }

    private DepartamentoEntity crearDepartamento(
            String nombre,
            String direccion,
            String tel,
            String email
    ) {
        DepartamentoEntity dpto = new DepartamentoEntity();
        dpto.setNombre(nombre);
        dpto.setDireccion(direccion);
        dpto.setTelefono(tel);
        dpto.setEmail(email);
        return departamentoRepository.save(dpto);
    }

    private void crearUDE(UserEntity user, DepartamentoEntity dept) {
        Set<Rol> roles = Set.of(
                Rol.ADMINISTRACION,
                Rol.DOCENTE,
                Rol.COORDINACION_COMISION_CURRICULAR,
                Rol.SECRETARIA,
                Rol.DIRECCION_ADMINISTRATIVA
        );

        UsuarioDepartamentoEntity ude = new UsuarioDepartamentoEntity();
        ude.setUsuario(user);
        ude.setDepartamento(dept);
        ude.setEmail("");
        ude.setRoles(roles);
        udeRepository.save(ude);
        user.getDepartamentos().add(ude);


    }
}
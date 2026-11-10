package com.santimaszong.Sistema_de_Gestion_de_Programas.local;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.seeder.DatabaseSeeder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.postgresql.ds.PGSimpleDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Commit;
import org.springframework.test.context.ContextConfiguration;

import javax.sql.DataSource;
import java.io.OutputStream;
import java.io.PrintStream;
import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

/** Lanzador explícito: escribe únicamente en el PostgreSQL local de pruebas. */
@EnabledIfSystemProperty(named = "silabus.seed.local", matches = "true")
@DataJpaTest(showSql = false, properties = {
        "spring.jpa.hibernate.ddl-auto=update",
        "spring.flyway.enabled=false",
        "spring.sql.init.mode=never",
        "spring.main.banner-mode=off",
        "logging.level.root=OFF"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes = LocalDatabaseSeedTest.Config.class)
@Import(DatabaseSeeder.class)
class LocalDatabaseSeedTest {
    @Configuration
    @EnableAutoConfiguration
    @EntityScan(basePackageClasses = ProgramaEntity.class)
    @EnableJpaRepositories(basePackageClasses = ProgramaRepository.class)
    static class Config {
        @Bean
        DataSource localDataSource() throws SQLException {
            if (!"true".equals(System.getProperty("silabus.seed.local"))) {
                throw new IllegalStateException("La carga local requiere autorización explícita en el comando");
            }
            // No se toma una URL del entorno ni de las propiedades habituales.
            PGSimpleDataSource source = new PGSimpleDataSource();
            source.setServerNames(new String[]{"127.0.0.1"});
            source.setPortNumbers(new int[]{5433});
            source.setDatabaseName("silabus_pruebas");
            source.setUser("silabus");
            source.setConnectTimeout(5);
            // Esta comprobación sucede al crear el DataSource, antes del DDL de Hibernate.
            try (var connection = source.getConnection()) {
                if (!"silabus_pruebas".equals(connection.getCatalog())
                        || !connection.getMetaData().getURL().startsWith("jdbc:postgresql://127.0.0.1:5433/")) {
                    throw new IllegalStateException("Destino incorrecto: se cancela la carga local");
                }
            }
            return source;
        }

        @Bean
        PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }
    }

    @Autowired DatabaseSeeder seeder;
    @Autowired DepartamentoRepository departamentos;
    @Autowired CarreraRepository carreras;
    @Autowired CarreraPlanRepository planes;
    @Autowired UserRepository usuarios;
    @Autowired UsuarioDepartamentoRepository vinculos;

    @Test
    @Commit
    void cargarDatosInicialesEnLaBaseLocal() {
        PrintStream originalOut = System.out;
        PrintStream originalErr = System.err;
        // No exponer posibles mensajes con credenciales del seeder existente.
        try (PrintStream descartado = new PrintStream(OutputStream.nullOutputStream())) {
            System.setOut(descartado);
            System.setErr(descartado);
            try {
                seeder.run();
            } catch (Exception ex) {
                throw new IllegalStateException("No se completó la carga local; se omite el detalle para no exponer credenciales");
            } finally {
                System.setOut(originalOut);
                System.setErr(originalErr);
            }
        }
        assertThat(departamentos.count()).isPositive();
        assertThat(carreras.count()).isPositive();
        assertThat(planes.count()).isPositive();
        assertThat(usuarios.count()).isPositive();
        assertThat(vinculos.count()).isPositive();
        System.out.printf("SEED_LOCAL: departamentos=%d carreras=%d planes=%d usuarios=%d vinculos=%d%n",
                departamentos.count(), carreras.count(), planes.count(), usuarios.count(), vinculos.count());
    }
}

package com.santimaszong.Sistema_de_Gestion_de_Programas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;
import java.sql.SQLException;

/** Conexión exclusiva del entorno manual local; no acepta URLs del entorno. */
@Configuration(proxyBeanMethods = false)
@Profile("dev-local")
public class DevLocalConfig {
    @Bean
    DataSource dataSource() throws SQLException {
        DriverManagerDataSource source = new DriverManagerDataSource();
        source.setDriverClassName("org.postgresql.Driver");
        source.setUrl("jdbc:postgresql://127.0.0.1:5433/silabus_pruebas?connectTimeout=5");
        source.setUsername("silabus");
        source.setPassword("");
        // Hibernate recibe el DataSource solo después de comprobar el destino.
        try (var connection = source.getConnection()) {
            if (!"silabus_pruebas".equals(connection.getCatalog())
                    || !connection.getMetaData().getURL().startsWith("jdbc:postgresql://127.0.0.1:5433/")) {
                throw new IllegalStateException("Se cancela el arranque: la base no es la local de pruebas");
            }
        }
        return source;
    }
}

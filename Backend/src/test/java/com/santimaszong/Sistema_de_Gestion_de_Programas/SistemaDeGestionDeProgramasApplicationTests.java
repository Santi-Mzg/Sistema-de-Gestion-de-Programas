package com.santimaszong.Sistema_de_Gestion_de_Programas;

import org.junit.jupiter.api.Test;
import com.santimaszong.Sistema_de_Gestion_de_Programas.support.IsolatedApplicationTest;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ai.formatterAPA.providers.GeminiBibliografiaFormatterService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.providers.ResendEmailSender;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.seeder.DatabaseSeeder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import javax.sql.DataSource;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mockingDetails;

class SistemaDeGestionDeProgramasApplicationTests extends IsolatedApplicationTest {
    @Autowired DataSource dataSource;
    @Autowired ApplicationContext context;

    @Test
    void contextLoads() throws Exception {
        try (var connection = dataSource.getConnection()) {
            assertThat(connection.getMetaData().getURL()).startsWith("jdbc:h2:mem:");
        }
        assertThat(mockingDetails(context.getBean(DatabaseSeeder.class)).isMock()).isTrue();
        assertThat(mockingDetails(context.getBean(ResendEmailSender.class)).isMock()).isTrue();
        assertThat(mockingDetails(context.getBean(GeminiBibliografiaFormatterService.class)).isMock()).isTrue();
    }

}

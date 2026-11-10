package com.santimaszong.Sistema_de_Gestion_de_Programas.support;

import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ai.formatterAPA.providers.GeminiBibliografiaFormatterService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.providers.ResendEmailSender;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.seeder.DatabaseSeeder;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

/** Contexto HTTP de pruebas sin seeder ni clientes de correo o IA reales. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK,
        properties = {"spring.config.location=classpath:application-ci.properties", "spring.profiles.active=ci"})
@TestPropertySource(locations = "classpath:application-ci.properties")
@MockBean({DatabaseSeeder.class, ResendEmailSender.class, GeminiBibliografiaFormatterService.class})
public abstract class IsolatedApplicationTest {
}
